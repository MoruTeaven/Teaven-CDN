import { Hono } from 'hono'
import { getPackageVersion, getFileUrl } from '../services/jsdelivr'
import { requireAdmin } from '../middleware/auth'
import { withCdnUrls, type PackageRecord } from '../utils/cdn'
import { findEntryFile } from '../utils/matcher'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
  ADMIN_TOKEN?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', requireAdmin)

app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, version } = body as { name: string, version: string }

    if (!name || !version) {
      return c.json({ error: 'Name and version are required' }, 400)
    }

    const existing = await c.env.DB.prepare(
      'SELECT * FROM packages WHERE name = ? AND version = ?'
    ).bind(name, version).first()

    if (existing) {
      return c.json({
        error: 'Package already exists',
        package: withCdnUrls(existing as PackageRecord, c.env)
      }, 409)
    }

    const pkgVersion = await getPackageVersion(name, version)
    const entryFile = findEntryFile(name, pkgVersion.files, pkgVersion.default)

    if (!entryFile) {
      const fileList = pkgVersion.files.map(f => f.name).slice(0, 20)
      return c.json({
        error: 'No entry file found',
        detail: `Checked ${pkgVersion.files.length} files for ${name}@${version}`,
        files: fileList
      }, 400)
    }

    const sourceUrl = getFileUrl(name, version, entryFile)
    const response = await fetch(sourceUrl)
    if (!response.ok) {
      return c.json({ error: 'Failed to download file' }, 500)
    }

    const blob = await response.blob()
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type') || 'application/javascript'

    const filePath = `npm/${name}/${version}/${entryFile.split('/').pop()}`
    const fileName = entryFile.split('/').pop() || entryFile

    await c.env.R2_BUCKET.put(filePath, blob, {
      httpMetadata: {
        contentType: contentType,
        cacheControl: 'public,max-age=31536000,immutable'
      }
    })

    const result = await c.env.DB.prepare(
      'INSERT OR IGNORE INTO packages (name, version, file_name, file_path, source_url, source_type, file_size, content_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
    ).bind(
      name,
      version,
      fileName,
      filePath,
      sourceUrl,
      'jsdelivr',
      contentLength ? parseInt(contentLength) : blob.size,
      contentType
    ).run()

    const inserted = (result.results as PackageRecord[] | undefined)?.[0]

    if (!inserted) {
      const duplicate = await c.env.DB.prepare(
        'SELECT * FROM packages WHERE name = ? AND version = ?'
      ).bind(name, version).first()

      if (duplicate) {
        return c.json({
          error: 'Package already exists',
          package: withCdnUrls(duplicate as PackageRecord, c.env)
        }, 409)
      }

      return c.json({ error: 'Failed to save package' }, 500)
    }

    await c.env.DB.prepare(
      "INSERT INTO logs (action, target, detail, status) VALUES (?, ?, ?, ?)"
    ).bind('add', `${name}@${version}`, `转存 ${name}@${version} 成功`, 'success').run()

    return c.json({
      success: true,
      package: withCdnUrls(inserted, c.env)
    })
  } catch (e) {
    return c.json({ error: 'Failed to favorite package' }, 500)
  }
})

export default app

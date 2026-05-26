import { Hono } from 'hono'
import { searchPackages, getPackageVersion, getFileUrl } from '../services/jsdelivr'
import { findEntryFile } from '../utils/matcher'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
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
      package: {
        ...existing,
        cdn_url: `https://${c.env.CDN_DOMAIN}${existing.file_path}`,
        global_cdn_url: `https://${c.env.GLOBAL_CDN_DOMAIN}${existing.file_path}`
      }
    }, 409)
  }

  try {
    const pkgVersion = await getPackageVersion(name, version)
    const entryFile = findEntryFile(name, pkgVersion.files, pkgVersion.default)

    if (!entryFile) {
      return c.json({ error: 'No entry file found' }, 400)
    }

    const sourceUrl = getFileUrl(name, version, entryFile)
    const response = await fetch(sourceUrl)
    if (!response.ok) {
      return c.json({ error: 'Failed to download file' }, 500)
    }

    const blob = await response.blob()
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type') || 'application/javascript'

    const filePath = `/npm/${name}/${version}/${entryFile.split('/').pop()}`
    const fileName = entryFile.split('/').pop() || entryFile

    await c.env.R2_BUCKET.put(filePath, blob, {
      httpMetadata: {
        contentType: contentType,
        cacheControl: 'public,max-age=31536000,immutable'
      }
    })

    const result = await c.env.DB.prepare(
      'INSERT INTO packages (name, version, file_name, file_path, source_url, source_type, file_size, content_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
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

    const inserted = (result.results as any[])[0]

    return c.json({
      success: true,
      package: {
        ...inserted,
        cdn_url: `https://${c.env.CDN_DOMAIN}${filePath}`,
        global_cdn_url: `https://${c.env.GLOBAL_CDN_DOMAIN}${filePath}`
      }
    })
  } catch (e) {
    return c.json({ error: 'Failed to favorite package' }, 500)
  }
})

export default app

import { Hono } from 'hono'
import { requireAdmin } from '../middleware/auth'
import { withCdnUrls, type PackageRecord } from '../utils/cdn'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
  ADMIN_TOKEN?: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1)
  const pageSize = Math.min(Math.max(parseInt(c.req.query('pageSize') || '20'), 1), 100)
  const offset = (page - 1) * pageSize

  let query = 'SELECT * FROM packages'
  let countQuery = 'SELECT COUNT(*) as total FROM packages'
  const params: string[] = []

  if (q) {
    query += ' WHERE name LIKE ?'
    countQuery += ' WHERE name LIKE ?'
    params.push(`%${q}%`)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'

  const [result, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, pageSize, offset).all(),
    c.env.DB.prepare(countQuery).bind(...params).first()
  ])

  return c.json({
    packages: (result.results as PackageRecord[]).map(pkg => withCdnUrls(pkg, c.env)),
    pagination: {
      page,
      pageSize,
      total: (countResult as any)?.total || 0
    }
  })
})

app.use('*', requireAdmin)

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM packages ORDER BY created_at DESC'
  ).all()
  return c.json({
    packages: (results as PackageRecord[]).map(pkg => withCdnUrls(pkg, c.env))
  })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const pkg = await c.env.DB.prepare(
    'SELECT * FROM packages WHERE id = ?'
  ).bind(id).first()

  if (!pkg) {
    return c.json({ error: 'Package not found' }, 404)
  }

  const pkgName = pkg.name as string
  const pkgVersion = pkg.version as string

  await c.env.R2_BUCKET.delete(pkg.file_path as string)

  await c.env.DB.prepare(
    'DELETE FROM packages WHERE id = ?'
  ).bind(id).run()

  await c.env.DB.prepare(
    "INSERT INTO logs (action, target, detail, status) VALUES (?, ?, ?, ?)"
  ).bind('delete', `${pkgName}@${pkgVersion}`, `删除 ${pkgName}@${pkgVersion} 成功`, 'success').run()

  return c.json({ success: true })
})

export default app

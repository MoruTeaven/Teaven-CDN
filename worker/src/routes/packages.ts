import { Hono } from 'hono'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM packages ORDER BY created_at DESC'
  ).all()
  return c.json({ packages: results })
})

app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const pkg = await c.env.DB.prepare(
    'SELECT * FROM packages WHERE id = ?'
  ).bind(id).first()

  if (!pkg) {
    return c.json({ error: 'Package not found' }, 404)
  }

  await c.env.R2_BUCKET.delete(pkg.file_path as string)

  await c.env.DB.prepare(
    'DELETE FROM packages WHERE id = ?'
  ).bind(id).run()

  return c.json({ success: true })
})

export default app

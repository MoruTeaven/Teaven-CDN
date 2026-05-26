import { Hono } from 'hono'
import { searchPackages, getPackageVersion } from '../services/jsdelivr'

const app = new Hono()

app.get('/', async (c) => {
  const q = c.req.query('q')
  if (!q) {
    return c.json({ error: 'Query is required' }, 400)
  }
  try {
    const pkg = await searchPackages(q)
    const latestVersion = pkg.tags?.latest || pkg.versions[0]
    return c.json({
      name: pkg.name,
      versions: pkg.versions.slice(0, 20),
      latest: latestVersion
    })
  } catch (e) {
    return c.json({ error: 'Package not found' }, 404)
  }
})

app.get('/:name/:version', async (c) => {
  const name = c.req.param('name')
  const version = c.req.param('version')
  try {
    const pkg = await getPackageVersion(name, version)
    return c.json({
      name: pkg.name,
      version: pkg.version,
      default: pkg.default,
      files: pkg.files.map(f => ({ name: f.name, size: f.size }))
    })
  } catch (e) {
    return c.json({ error: 'Version not found' }, 404)
  }
})

export default app

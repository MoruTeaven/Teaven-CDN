import { Hono } from 'hono'
import { cors } from 'hono/cors'
import searchRoute from './routes/search'
import favoriteRoute from './routes/favorite'
import packagesRoute from './routes/packages'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.route('/api/search', searchRoute)
app.route('/api/favorite', favoriteRoute)
app.route('/api/packages', packagesRoute)

app.get('/', (c) => {
  return c.text('CDN Manager API')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app

import { Hono } from 'hono'
import { requireAdmin } from '../middleware/auth'

interface Env {
  DB: D1Database
  R2_BUCKET: R2Bucket
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
  ADMIN_TOKEN?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', requireAdmin)

app.get('/', async (c) => {
  try {
    const pkgCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM packages'
    ).first<{ count: number }>()

    const sizeResult = await c.env.DB.prepare(
      'SELECT COALESCE(SUM(file_size), 0) as total_size FROM packages'
    ).first<{ total_size: number }>()

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthStart = thisMonth.toISOString()

    const newThisMonth = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM packages WHERE created_at >= ?'
    ).bind(monthStart).first<{ count: number }>()

    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthStart = lastMonth.toISOString()

    const newLastMonth = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM packages WHERE created_at >= ? AND created_at < ?'
    ).bind(lastMonthStart, monthStart).first<{ count: number }>()

    let todayActions = 0
    try {
      const recentLogs = await c.env.DB.prepare(
        "SELECT * FROM logs WHERE action = 'add' AND created_at >= date('now', '-1 day') ORDER BY created_at DESC"
      ).all()
      todayActions = recentLogs?.results?.length || 0
    } catch {
      // logs 表可能不存在
    }

    const totalSize = sizeResult?.total_size || 0
    const formattedSize = totalSize >= 1073741824
      ? `${(totalSize / 1073741824).toFixed(1)} GB`
      : totalSize >= 1048576
        ? `${(totalSize / 1048576).toFixed(1)} MB`
        : totalSize >= 1024
          ? `${(totalSize / 1024).toFixed(1)} KB`
          : `${totalSize} B`

    return c.json({
      totalPackages: pkgCount?.count || 0,
      totalSize,
      totalSizeFormatted: formattedSize,
      newThisMonth: newThisMonth?.count || 0,
      monthGrowth: (newThisMonth?.count || 0) - (newLastMonth?.count || 0),
      todayActions
    })
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

export default app

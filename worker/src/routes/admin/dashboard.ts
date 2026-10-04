import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/stats', async (c) => {
  const totalOrders = await c.env.DB.prepare('SELECT count(*) as count FROM orders').first<{ count: number }>();
  const newOrders = await c.env.DB.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'new'").first<{ count: number }>();
  const totalRevenue = await c.env.DB.prepare(
    "SELECT sum(grand_total) as total FROM orders WHERE payment_status IN ('received', 'paid')"
  ).first<{ total: number }>();
  const totalProducts = await c.env.DB.prepare('SELECT count(*) as count FROM products WHERE is_active = 1').first<{ count: number }>();

  // Low stock products
  const { results: lowStock } = await c.env.DB.prepare(`
    SELECT id, name, sku, stock_quantity, low_stock_threshold
    FROM products
    WHERE is_active = 1 AND stock_quantity <= low_stock_threshold
    ORDER BY stock_quantity ASC
    LIMIT 10
  `).all();

  // Recent orders
  const { results: recentOrders } = await c.env.DB.prepare(`
    SELECT id, order_number, customer_name, customer_phone, grand_total, order_status, payment_status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  // Orders grouped by status
  const { results: statusCounts } = await c.env.DB.prepare(`
    SELECT order_status, count(*) as count
    FROM orders
    GROUP BY order_status
  `).all();

  return c.json({
    total_orders: totalOrders?.count || 0,
    new_orders: newOrders?.count || 0,
    total_revenue: totalRevenue?.total || 0,
    total_products: totalProducts?.count || 0,
    low_stock_products: lowStock,
    recent_orders: recentOrders,
    orders_by_status: statusCounts,
  });
});

export default app;

import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM coupons ORDER BY created_at DESC'
  ).all();
  return c.json(results);
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const res = await c.env.DB.prepare(`
      INSERT INTO coupons (code, type, value, min_order_value, max_discount, start_date, end_date, usage_limit, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.code.trim().toUpperCase(),
      body.type || 'percentage',
      Number(body.value) || 0,
      Number(body.min_order_value) || 0,
      body.max_discount ? Number(body.max_discount) : null,
      body.start_date || null,
      body.end_date || null,
      body.usage_limit ? Number(body.usage_limit) : null,
      body.is_active ? 1 : 0
    ).run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err) {
    console.error('Create coupon error:', err);
    return c.json({ error: 'Failed to create coupon' }, 500);
  }
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

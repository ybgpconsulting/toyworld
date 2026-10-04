import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM shipping_rules ORDER BY priority DESC, min_order_value ASC'
  ).all();
  return c.json(results);
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const res = await c.env.DB.prepare(`
      INSERT INTO shipping_rules (rule_type, name, state_name, pincode_prefix, min_order_value, shipping_amount, is_free, is_active, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.rule_type || 'flat_rate',
      body.name,
      body.state_name || null,
      body.pincode_prefix || null,
      Number(body.min_order_value) || 0,
      Number(body.shipping_amount) || 0,
      body.is_free ? 1 : 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      Number(body.priority) || 0
    ).run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err) {
    console.error('Create shipping rule error:', err);
    return c.json({ error: 'Failed to create shipping rule' }, 500);
  }
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM shipping_rules WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

// List all reviews with approval filter
app.get('/', async (c) => {
  const status = c.req.query('status'); // 'pending', 'approved', 'all'
  let query = `
    SELECT r.*, p.name as product_name, p.slug as product_slug
    FROM reviews r
    JOIN products p ON r.product_id = p.id
  `;
  const params: (string | number)[] = [];

  if (status === 'pending') {
    query += ' WHERE r.is_approved = 0';
  } else if (status === 'approved') {
    query += ' WHERE r.is_approved = 1';
  }

  query += ' ORDER BY r.created_at DESC LIMIT 100';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// Approve review
app.post('/:id/approve', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('UPDATE reviews SET is_approved = 1, updated_at = datetime(\'now\') WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// Reject/hide review
app.post('/:id/reject', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('UPDATE reviews SET is_approved = 0, updated_at = datetime(\'now\') WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// Delete review
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

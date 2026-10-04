import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/banners', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM homepage_banners ORDER BY display_order ASC'
  ).all();
  return c.json(results);
});

app.post('/banners', async (c) => {
  try {
    const body = await c.req.json();
    const res = await c.env.DB.prepare(`
      INSERT INTO homepage_banners (title, subtitle, image_url, cta_text, cta_link, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.title || null,
      body.subtitle || null,
      body.image_url || null,
      body.cta_text || null,
      body.cta_link || null,
      Number(body.display_order) || 0,
      body.is_active ? 1 : 0
    ).run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err) {
    console.error('Create banner error:', err);
    return c.json({ error: 'Failed to create banner' }, 500);
  }
});

app.delete('/banners/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM homepage_banners WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

app.get('/sections', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM homepage_sections ORDER BY display_order ASC'
  ).all();
  return c.json(results);
});

app.patch('/sections/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE homepage_sections SET
        title = COALESCE(?, title),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active)
      WHERE section_key = ?
    `).bind(
      body.title ?? null,
      body.display_order !== undefined ? Number(body.display_order) : null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      key
    ).run();

    return c.json({ success: true });
  } catch (err) {
    console.error('Update section error:', err);
    return c.json({ error: 'Failed to update section' }, 500);
  }
});

export default app;

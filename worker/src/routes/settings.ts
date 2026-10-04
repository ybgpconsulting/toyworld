import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/store', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM store_settings').all();
  const settings = results.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {});
  return c.json(settings);
});

app.get('/shipping', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM shipping_rules WHERE is_active = 1 ORDER BY priority ASC').all();
  return c.json(results);
});

app.get('/homepage/config', async (c) => {
  const { results: banners } = await c.env.DB.prepare('SELECT * FROM homepage_banners WHERE is_active = 1 ORDER BY display_order').all();
  const { results: sections } = await c.env.DB.prepare('SELECT * FROM homepage_sections WHERE is_active = 1 ORDER BY display_order').all();
  return c.json({ banners, sections });
});

app.get('/pages/:slug', async (c) => {
  const page = await c.env.DB.prepare('SELECT * FROM page_content WHERE slug = ? AND is_active = 1').bind(c.req.param('slug')).first();
  if (!page) return c.json({ error: 'Not found' }, 404);
  return c.json(page);
});

export default app;

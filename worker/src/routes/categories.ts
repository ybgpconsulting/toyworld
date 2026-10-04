import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order').all();
  return c.json(results);
});

app.get('/tree', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order').all();
  // Simplified tree approach for now: return all
  return c.json(results);
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const cat = await c.env.DB.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first();
  if (!cat) return c.json({ error: 'Not found' }, 404);
  
  const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE category_id = ? AND is_active = 1').bind(cat.id).all();
  return c.json({ category: cat, products });
});

export default app;

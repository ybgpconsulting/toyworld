import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM brands WHERE is_active = 1 ORDER BY display_order').all();
  return c.json(results);
});

export default app;

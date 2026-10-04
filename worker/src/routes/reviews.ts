import { Hono } from 'hono';
import { Env } from '../types';
import { rateLimiter } from '../middleware/rateLimit';

const app = new Hono<{ Bindings: Env }>();

app.post('/', rateLimiter(5, 60000), async (c) => {
  const body = await c.req.json();
  const ip = c.req.header('CF-Connecting-IP') || '';
  
  await c.env.DB.prepare(
    'INSERT INTO reviews (product_id, order_id, customer_name, rating, title, body, ip_address, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
  ).bind(body.product_id, body.order_id || null, body.customer_name, body.rating, body.title, body.body, ip).run();
  
  return c.json({ success: true });
});

app.get('/product/:productId', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC'
  ).bind(c.req.param('productId')).all();
  
  const ratingRes = await c.env.DB.prepare(
    'SELECT avg(rating) as average_rating, count(*) as total_reviews FROM reviews WHERE product_id = ? AND is_approved = 1'
  ).bind(c.req.param('productId')).first() as any;
  
  return c.json({ 
    reviews: results, 
    summary: { 
      average_rating: ratingRes ? Math.round(ratingRes.average_rating * 10) / 10 : 0, 
      total_reviews: ratingRes ? ratingRes.total_reviews : 0 
    } 
  });
});

export default app;

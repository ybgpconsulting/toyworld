import { Hono } from 'hono';
import { Env } from '../types';
import { validateCoupon } from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

app.post('/validate', async (c) => {
  const { code, orderAmount } = await c.req.json();
  const discount = await validateCoupon(c.env, code, orderAmount);
  
  if (discount === null) {
    return c.json({ error: 'Invalid or expired coupon' }, 400);
  }
  
  return c.json({ success: true, discount });
});

export default app;

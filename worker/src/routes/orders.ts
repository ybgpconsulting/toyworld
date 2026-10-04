import { Hono } from 'hono';
import { Env } from '../types';
import { generateOrderNumber } from '../utils/helpers';
import { createOrderAtomic } from '../db/queries';
import { generateOrderMessage, buildWhatsAppUrl } from '../services/whatsapp';
import { syncOrderToSheets } from '../services/sheets';

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const orderNum = generateOrderNumber();
    
    // Simplistic validation
    if (!body.customer_name || !body.customer_phone || !body.items || !body.address) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const orderData = {
      order_number: orderNum,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      subtotal: body.subtotal,
      grand_total: body.grand_total,
      discount_amount: body.discount_amount,
      shipping_amount: body.shipping_amount,
      coupon_code: body.coupon_code,
      customer_note: body.customer_note
    };
    
    const orderId = await createOrderAtomic(c.env, orderData, body.items, body.address);
    
    const msg = generateOrderMessage(orderData, body.items, body.address);
    const waUrl = buildWhatsAppUrl(msg);
    
    await c.env.DB.prepare('UPDATE orders SET whatsapp_link = ? WHERE id = ?').bind(waUrl, orderId).run();
    
    // Fire and forget sheets sync
    c.executionCtx.waitUntil(syncOrderToSheets({ ...orderData, id: orderId, order_status: 'pending' }, c.env));
    
    return c.json({ 
      success: true, 
      order_number: orderNum, 
      order_id: orderId, 
      whatsapp_url: waUrl, 
      grand_total: body.grand_total 
    });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: 'Order creation failed' }, 500);
  }
});

app.get('/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_number = ?').bind(orderNumber).first();
  if (!order) return c.json({ error: 'Order not found' }, 404);
  
  const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
  const address = await c.env.DB.prepare('SELECT * FROM order_addresses WHERE order_id = ?').bind(order.id).first();
  
  return c.json({ ...order, items, address });
});

export default app;

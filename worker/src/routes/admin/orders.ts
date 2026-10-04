import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

// List all orders with filters
app.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || 20)));
  const offset = (page - 1) * limit;
  const status = c.req.query('status');
  const paymentStatus = c.req.query('payment_status');
  const search = c.req.query('search')?.trim();

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: (string | number)[] = [];

  if (status) {
    query += ' AND order_status = ?';
    params.push(status);
  }
  if (paymentStatus) {
    query += ' AND payment_status = ?';
    params.push(paymentStatus);
  }
  if (search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
  const countRes = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    data: results,
    total: countRes?.total || 0,
    page,
    limit,
  });
});

// Single order with items, address, and status history
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  if (!order) return c.json({ error: 'Order not found' }, 404);

  const { results: items } = await c.env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).bind(id).all();

  const address = await c.env.DB.prepare(
    'SELECT * FROM order_addresses WHERE order_id = ?'
  ).bind(id).first();

  const { results: history } = await c.env.DB.prepare(
    'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC'
  ).bind(id).all();

  return c.json({ ...order, items, address, history });
});

// Update order status, payment status, shipping status, tracking number, internal note
app.patch('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    const existingOrder = await c.env.DB.prepare(
      'SELECT order_status, payment_status, shipping_status FROM orders WHERE id = ?'
    ).bind(id).first<{
      order_status: string;
      payment_status: string;
      shipping_status: string;
    }>();

    if (!existingOrder) return c.json({ error: 'Order not found' }, 404);

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (body.order_status !== undefined) {
      updates.push('order_status = ?');
      params.push(body.order_status);

      if (body.order_status !== existingOrder.order_status) {
        await c.env.DB.prepare(`
          INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
          VALUES (?, 'order_status', ?, ?, ?)
        `).bind(id, existingOrder.order_status, body.order_status, body.note || 'Status updated by Admin').run();
      }
    }

    if (body.payment_status !== undefined) {
      updates.push('payment_status = ?');
      params.push(body.payment_status);

      if (body.payment_status !== existingOrder.payment_status) {
        await c.env.DB.prepare(`
          INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
          VALUES (?, 'payment_status', ?, ?, ?)
        `).bind(id, existingOrder.payment_status, body.payment_status, body.note || 'Payment status updated by Admin').run();
      }
    }

    if (body.shipping_status !== undefined) {
      updates.push('shipping_status = ?');
      params.push(body.shipping_status);

      if (body.shipping_status !== existingOrder.shipping_status) {
        await c.env.DB.prepare(`
          INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
          VALUES (?, 'shipping_status', ?, ?, ?)
        `).bind(id, existingOrder.shipping_status, body.shipping_status, body.note || 'Shipping status updated by Admin').run();
      }
    }

    if (body.tracking_number !== undefined) {
      updates.push('tracking_number = ?');
      params.push(body.tracking_number);
    }

    if (body.internal_note !== undefined) {
      updates.push('internal_note = ?');
      params.push(body.internal_note);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      params.push(id);
      await c.env.DB.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    }

    return c.json({ success: true });
  } catch (err: unknown) {
    console.error('Update order error:', err);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

export default app;

import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * Endpoint called by Google Apps Script onEdit trigger when staff changes statuses
 */
app.post('/sheets/sync', async (c) => {
  try {
    const webhookSecret = c.req.header('X-Webhook-Secret');
    const configuredSecret = c.env.GOOGLE_SHEETS_WEBHOOK_SECRET || 'change-this-sheets-secret';

    if (!webhookSecret || webhookSecret !== configuredSecret) {
      return c.json({ error: 'Unauthorized: Invalid webhook secret' }, 401);
    }

    const body = await c.req.json<{
      order_number: string;
      payment_status?: string;
      order_status?: string;
      shipping_status?: string;
      tracking_number?: string;
      internal_note?: string;
    }>();

    if (!body.order_number) {
      return c.json({ error: 'Missing order_number' }, 400);
    }

    const order = await c.env.DB.prepare(
      'SELECT id, order_status, payment_status, shipping_status FROM orders WHERE order_number = ?'
    )
      .bind(body.order_number)
      .first<{
        id: number;
        order_status: string;
        payment_status: string;
        shipping_status: string;
      }>();

    if (!order) {
      return c.json({ error: 'Order not found in database' }, 404);
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (body.payment_status && body.payment_status !== order.payment_status) {
      updates.push('payment_status = ?');
      params.push(body.payment_status);
    }
    if (body.order_status && body.order_status !== order.order_status) {
      updates.push('order_status = ?');
      params.push(body.order_status);
    }
    if (body.shipping_status && body.shipping_status !== order.shipping_status) {
      updates.push('shipping_status = ?');
      params.push(body.shipping_status);
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
      params.push(order.id);

      await c.env.DB.prepare(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`
      )
        .bind(...params)
        .run();

      // Log to history
      if (body.order_status && body.order_status !== order.order_status) {
        await c.env.DB.prepare(`
          INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
          VALUES (?, 'order_status', ?, ?, 'Updated via Google Sheets sync')
        `)
          .bind(order.id, order.order_status, body.order_status)
          .run();
      }
    }

    return c.json({ success: true, message: 'Order synchronized successfully' });
  } catch (error: unknown) {
    console.error('Google Sheets sync error:', error);
    return c.json({ error: 'Internal server error processing sync' }, 500);
  }
});

export default app;

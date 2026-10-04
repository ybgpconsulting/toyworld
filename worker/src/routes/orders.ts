import { Hono } from 'hono';
import { Env } from '../types';
import { generateOrderNumber, validateIndianPhone, validateIndianPincode } from '../utils/helpers';
import { createOrderAtomic, validateCoupon } from '../db/queries';
import { generateOrderMessage, buildWhatsAppUrl } from '../services/whatsapp';
import { syncOrderToSheets } from '../services/sheets';

const app = new Hono<{ Bindings: Env }>();

async function calculateShippingAmount(env: Env, subtotal: number, state: string, pincode: string): Promise<number> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM shipping_rules WHERE is_active = 1 ORDER BY priority DESC, min_order_value DESC, id DESC'
  ).all<{ id: number; rule_type: string; state_name: string | null; pincode_prefix: string | null; min_order_value: number; shipping_amount: number; is_free: number; priority: number }>();

  const normalizedState = String(state ?? '').trim().toLowerCase();
  const normalizedPincode = String(pincode ?? '').trim();

  const pincodeRule = results.find((rule) => {
    if (!rule.pincode_prefix) return false;
    const prefix = String(rule.pincode_prefix).trim();
    return prefix && normalizedPincode.startsWith(prefix);
  });

  if (pincodeRule) {
    return Number(pincodeRule.is_free) ? 0 : Number(pincodeRule.shipping_amount || 0);
  }

  const stateRule = results.find((rule) => {
    if (rule.rule_type !== 'state') return false;
    return String(rule.state_name ?? '').trim().toLowerCase() === normalizedState;
  });

  if (stateRule) {
    return Number(stateRule.is_free) ? 0 : Number(stateRule.shipping_amount || 0);
  }

  const thresholdRule = results
    .filter((rule) => Number(rule.min_order_value || 0) <= subtotal && rule.rule_type === 'free_threshold')
    .sort((a, b) => Number(b.min_order_value || 0) - Number(a.min_order_value || 0))[0];

  if (thresholdRule) {
    return 0;
  }

  const flatRule = results
    .filter((rule) => rule.rule_type === 'flat_rate' || rule.rule_type === 'default')
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0];

  return flatRule ? Number(flatRule.shipping_amount || 0) : 0;
}

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const idempotencyKey = String(
      c.req.header('Idempotency-Key') || body.idempotency_key || body.idempotencyKey || ''
    ).trim();

    if (idempotencyKey) {
      const existing = await c.env.DB.prepare(
        'SELECT order_id, order_number FROM order_idempotency_keys WHERE idempotency_key = ?'
      )
        .bind(idempotencyKey)
        .first<{ order_id: number; order_number: string }>();

      if (existing) {
        const existingOrder = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(existing.order_id).first();

        if (existingOrder) {
          return c.json({
            success: true,
            order_number: existingOrder.order_number,
            order_id: existingOrder.id,
            whatsapp_url: existingOrder.whatsapp_link || '',
            grand_total: Number(existingOrder.grand_total)
          });
        }
      }
    }

    const orderNum = generateOrderNumber();
    const customerPhone = String(body.customer_phone ?? '').trim();
    const customerName = String(body.customer_name ?? '').trim();
    const address = body.address ?? {};
    const pincode = String(address.pincode ?? '').trim();

    if (!customerName || !customerPhone || !Array.isArray(body.items) || body.items.length === 0 || !address) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (!validateIndianPhone(customerPhone)) {
      return c.json({ error: 'Customer phone must be a valid 10-digit Indian mobile number' }, 400);
    }

    if (!address.flat_house || !address.street_locality || !address.city || !address.state || !pincode) {
      return c.json({ error: 'Delivery address is incomplete' }, 400);
    }

    if (!validateIndianPincode(pincode)) {
      return c.json({ error: 'Delivery pincode must be a valid 6-digit Indian pincode' }, 400);
    }

    const sanitizedItems: Array<{
      product_id: number;
      variant_id?: number;
      product_name: string;
      variant_name?: string;
      sku?: string;
      quantity: number;
      mrp: number;
      selling_price: number;
      total_price: number;
      image_url?: string;
    }> = [];

    let subtotal = 0;

    for (const rawItem of body.items) {
      const productId = Number(rawItem.product_id ?? rawItem.id);
      const quantity = Number(rawItem.quantity ?? 1);

      if (!productId || !Number.isFinite(productId) || quantity <= 0 || !Number.isFinite(quantity)) {
        return c.json({ error: 'Each item must include a valid product ID and quantity.' }, 400);
      }

      const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(productId).first<any>();

      if (!product) {
        return c.json({ error: `One of the selected products is no longer available.` }, 400);
      }

      let variant: any = null;
      if (rawItem.variant_id) {
        variant = await c.env.DB.prepare('SELECT * FROM product_variants WHERE id = ?').bind(Number(rawItem.variant_id)).first<any>();

        if (!variant || Number(variant.product_id) !== Number(productId)) {
          return c.json({ error: 'Selected variant is invalid for this product.' }, 400);
        }

        if (Number(variant.is_available) !== 1) {
          return c.json({ error: `One selected variant is currently unavailable.` }, 400);
        }

        if (Number(variant.stock_quantity || 0) < quantity) {
          return c.json({ error: `Not enough stock available for ${product.name}.` }, 400);
        }
      } else if (Number(product.stock_quantity || 0) < quantity) {
        return c.json({ error: `Not enough stock available for ${product.name}.` }, 400);
      }

      const unitPrice = Number(variant?.selling_price ?? product.selling_price ?? 0);
      const mrp = Number(variant?.mrp ?? product.mrp ?? unitPrice);
      const total = unitPrice * quantity;

      subtotal += total;

      sanitizedItems.push({
        product_id: productId,
        variant_id: variant ? Number(variant.id) : undefined,
        product_name: product.name,
        variant_name: variant?.variant_value || variant?.name || undefined,
        sku: variant?.sku || product.sku || undefined,
        quantity,
        mrp,
        selling_price: unitPrice,
        total_price: total,
        image_url: variant?.image_url || product.image_url || undefined,
      });
    }

    const normalizedCouponCode = body.coupon_code ? String(body.coupon_code).trim().toUpperCase() : '';
    let discountAmount = 0;

    if (normalizedCouponCode) {
      const discount = await validateCoupon(c.env, normalizedCouponCode, subtotal);
      if (discount === null) {
        return c.json({ error: 'This coupon is invalid, expired, or not eligible for your order.' }, 400);
      }
      discountAmount = discount;
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
    const shippingAmount = await calculateShippingAmount(c.env, subtotalAfterDiscount, address.state, pincode);
    const grandTotal = Math.max(0, subtotalAfterDiscount + shippingAmount);

    const orderData = {
      order_number: orderNum,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_alternate_phone: body.customer_alternate_phone,
      customer_email: body.customer_email,
      subtotal,
      grand_total: grandTotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      coupon_code: normalizedCouponCode || undefined,
      customer_note: body.customer_note,
    };

    const orderId = await createOrderAtomic(c.env, orderData, sanitizedItems, address);

    const msg = generateOrderMessage(orderData, sanitizedItems, address);
    const waUrl = buildWhatsAppUrl(msg);

    await c.env.DB.prepare('UPDATE orders SET whatsapp_link = ? WHERE id = ?').bind(waUrl, orderId).run();

    if (idempotencyKey) {
      await c.env.DB.prepare(
        'INSERT INTO order_idempotency_keys (idempotency_key, order_id, order_number) VALUES (?, ?, ?)'
      )
        .bind(idempotencyKey, orderId, orderNum)
        .run();
    }

    c.executionCtx.waitUntil(syncOrderToSheets({ ...orderData, id: orderId, order_status: 'pending' }, c.env));

    return c.json({
      success: true,
      order_number: orderNum,
      order_id: orderId,
      whatsapp_url: waUrl,
      grand_total: grandTotal,
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

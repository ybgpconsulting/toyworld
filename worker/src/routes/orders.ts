import { Hono } from 'hono';
import { Env } from '../types';
import { generateOrderNumber, validateIndianPhone, validateIndianPincode } from '../utils/helpers';
import { createOrderAtomic } from '../db/queries';
import {
  calculateCheckoutQuote,
  CheckoutAddressInput,
  CheckoutItemInput,
  CheckoutPricingError,
} from '../services/orderPricing';
import { generateOrderMessage, buildWhatsAppUrl } from '../services/whatsapp';
import { syncOrderToSheets } from '../services/sheets';

interface OrderRequest {
  idempotency_key?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_alternate_phone?: string;
  customer_email?: string;
  customer_note?: string;
  coupon_code?: string;
  items?: CheckoutItemInput[];
  address?: CheckoutAddressInput;
}

const app = new Hono<{ Bindings: Env }>();

function isValidAddress(address: CheckoutAddressInput | undefined): address is CheckoutAddressInput {
  return Boolean(
    address &&
    typeof address.flat_house === 'string' && address.flat_house.trim() &&
    typeof address.street_locality === 'string' && address.street_locality.trim() &&
    typeof address.city === 'string' && address.city.trim() &&
    typeof address.state === 'string' && address.state.trim() &&
    validateIndianPincode(address.pincode)
  );
}

function hasValidCouponCode(code: unknown): code is string | undefined {
  return code === undefined || typeof code === 'string';
}

function getPricingError(error: unknown): { error: string; status: 400 | 409 } | null {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof CheckoutPricingError) {
    return { error: error.message, status: error.status === 409 ? 409 : 400 };
  }
  if (message.includes('INSUFFICIENT_VARIANT_STOCK') || message.includes('INSUFFICIENT_PRODUCT_STOCK')) {
    return { error: 'Stock changed while you were checking out. Please update your cart and try again.', status: 409 };
  }
  if (message.includes('VARIANT_REQUIRED')) {
    return { error: 'Please select a valid product option before placing your order.', status: 409 };
  }
  if (message.includes('PRODUCT_UNAVAILABLE')) {
    return { error: 'One of the selected products is no longer available.', status: 409 };
  }
  if (message.includes('COUPON_UNAVAILABLE')) {
    return { error: 'This coupon is no longer available. Please remove it and try again.', status: 409 };
  }
  return null;
}

async function findIdempotentOrder(env: Env, key: string) {
  return env.DB.prepare(`
    SELECT o.id, o.order_number, o.grand_total, o.whatsapp_link
    FROM order_idempotency_keys k
    JOIN orders o ON o.id = k.order_id
    WHERE k.idempotency_key = ?
  `)
    .bind(key)
    .first<{ id: number; order_number: string; grand_total: number; whatsapp_link: string | null }>();
}

app.post('/quote', async (c) => {
  try {
    const body = await c.req.json<OrderRequest>();
    if (!hasValidCouponCode(body.coupon_code)) {
      return c.json({ error: 'Coupon code must be text.' }, 400);
    }
    if (!body.items?.length || !body.address?.state || !validateIndianPincode(body.address.pincode)) {
      return c.json({ error: 'Add items and enter a valid delivery state and pincode to get a quote.' }, 400);
    }

    const quote = await calculateCheckoutQuote(c.env, body.items, body.address, body.coupon_code);
    return c.json(quote);
  } catch (error: unknown) {
    const pricingError = getPricingError(error);
    if (pricingError) return c.json({ error: pricingError.error }, pricingError.status);
    console.error('Checkout quote error:', error);
    return c.json({ error: 'Could not calculate your checkout total. Please try again.' }, 500);
  }
});

app.post('/', async (c) => {
  let idempotencyKey = '';
  try {
    const body = await c.req.json<OrderRequest>();
    if (!hasValidCouponCode(body.coupon_code)) {
      return c.json({ error: 'Coupon code must be text.' }, 400);
    }
    idempotencyKey = String(c.req.header('Idempotency-Key') || body.idempotency_key || '').trim();
    if (!idempotencyKey || idempotencyKey.length > 128) {
      return c.json({ error: 'A valid checkout idempotency key is required.' }, 400);
    }

    const existing = await findIdempotentOrder(c.env, idempotencyKey);
    if (existing) {
      return c.json({
        success: true,
        order_number: existing.order_number,
        order_id: existing.id,
        whatsapp_url: existing.whatsapp_link || '',
        grand_total: Number(existing.grand_total),
      });
    }

    const customerName = String(body.customer_name || '').trim();
    const customerPhone = String(body.customer_phone || '').trim();
    const alternatePhone = String(body.customer_alternate_phone || '').trim();
    const email = String(body.customer_email || '').trim();

    if (!customerName || !validateIndianPhone(customerPhone)) {
      return c.json({ error: 'Please enter your name and a valid 10-digit Indian mobile number.' }, 400);
    }
    if (alternatePhone && !validateIndianPhone(alternatePhone)) {
      return c.json({ error: 'Please enter a valid 10-digit alternate mobile number.' }, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Please enter a valid email address.' }, 400);
    }
    if (!isValidAddress(body.address)) {
      return c.json({ error: 'Please complete your delivery address with a valid 6-digit pincode.' }, 400);
    }
    if (!body.items?.length) {
      return c.json({ error: 'Your cart is empty.' }, 400);
    }

    const quote = await calculateCheckoutQuote(c.env, body.items, body.address, body.coupon_code);
    if (quote.shipping === null || quote.grand_total === null) {
      return c.json({
        error: 'Shipping is not configured for this location. Please contact TOY WORLD on WhatsApp before placing your order.',
      }, 409);
    }

    const orderNumber = generateOrderNumber();
    const orderData = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_alternate_phone: alternatePhone || undefined,
      customer_email: email || undefined,
      subtotal: quote.subtotal,
      discount_amount: quote.discount,
      coupon_code: body.coupon_code?.trim().toUpperCase() || undefined,
      shipping_amount: quote.shipping,
      grand_total: quote.grand_total,
      customer_note: body.customer_note?.trim() || undefined,
    };
    const orderItems = quote.items.map(({ available_stock: _availableStock, ...item }) => item);
    const whatsappUrl = buildWhatsAppUrl(
      generateOrderMessage(orderData, orderItems, body.address)
    );

    const orderId = await createOrderAtomic(
      c.env,
      orderData,
      orderItems,
      body.address,
      idempotencyKey,
      whatsappUrl,
    );

    c.executionCtx.waitUntil(
      syncOrderToSheets({ ...orderData, id: orderId, order_status: 'new' }, c.env)
    );

    return c.json({
      success: true,
      order_number: orderNumber,
      order_id: orderId,
      whatsapp_url: whatsappUrl,
      grand_total: quote.grand_total,
    });
  } catch (error: unknown) {
    if (idempotencyKey) {
      const existing = await findIdempotentOrder(c.env, idempotencyKey);
      if (existing) {
        return c.json({
          success: true,
          order_number: existing.order_number,
          order_id: existing.id,
          whatsapp_url: existing.whatsapp_link || '',
          grand_total: Number(existing.grand_total),
        });
      }
    }

    const pricingError = getPricingError(error);
    if (pricingError) return c.json({ error: pricingError.error }, pricingError.status);
    console.error('Order creation error:', error);
    return c.json({ error: 'Your order could not be completed. Please try again.' }, 500);
  }
});

app.get('/:orderNumber', async (c) => {
  const order = await c.env.DB.prepare(`
    SELECT id, order_number, grand_total, order_status, payment_status,
           shipping_status, created_at
    FROM orders WHERE order_number = ?
  `)
    .bind(c.req.param('orderNumber'))
    .first<{
      id: number;
      order_number: string;
      grand_total: number;
      order_status: string;
      payment_status: string;
      shipping_status: string;
      created_at: string;
    }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  return c.json({ ...order, grand_total: Number(order.grand_total) });
});

export default app;

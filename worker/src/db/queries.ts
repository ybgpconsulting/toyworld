import { Env } from '../types';

export interface ProductFilters {
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  is_offer?: boolean;
  age_group?: string;
  sort?: string;
}

export async function getProducts(
  env: Env,
  filters: ProductFilters,
  pagination: { offset: number; limit: number }
) {
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params: (string | number)[] = [];

  if (filters.category_id) {
    query += ' AND category_id = ?';
    params.push(filters.category_id);
  }
  if (filters.brand_id) {
    query += ' AND brand_id = ?';
    params.push(filters.brand_id);
  }
  if (filters.min_price !== undefined) {
    query += ' AND selling_price >= ?';
    params.push(filters.min_price);
  }
  if (filters.max_price !== undefined) {
    query += ' AND selling_price <= ?';
    params.push(filters.max_price);
  }
  if (filters.is_featured) {
    query += ' AND is_featured = 1';
  }
  if (filters.is_bestseller) {
    query += ' AND is_bestseller = 1';
  }
  if (filters.is_new_arrival) {
    query += ' AND is_new_arrival = 1';
  }
  if (filters.is_offer) {
    query += ' AND is_offer = 1';
  }
  if (filters.age_group) {
    query += ' AND age_group = ?';
    params.push(filters.age_group);
  }

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      query += ' ORDER BY selling_price ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY selling_price DESC';
      break;
    case 'rating':
      query += ' ORDER BY is_bestseller DESC, selling_price DESC';
      break;
    default:
      query += ' ORDER BY created_at DESC';
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(pagination.limit, pagination.offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return results;
}

export async function getProductBySlug(env: Env, slug: string) {
  return env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
}

export async function validateCoupon(env: Env, code: string, orderAmount: number): Promise<number | null> {
  const coupon = await env.DB.prepare(
    'SELECT * FROM coupons WHERE code = ? AND is_active = 1'
  )
    .bind(code.toUpperCase())
    .first<{
      id: number;
      type: string;
      value: number;
      min_order_value: number;
      max_discount: number | null;
      start_date: string | null;
      end_date: string | null;
      usage_limit: number | null;
      used_count: number;
    }>();

  if (!coupon) return null;

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) return null;
  if (coupon.end_date && new Date(coupon.end_date) < now) return null;
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return null;
  if (orderAmount < (coupon.min_order_value || 0)) return null;

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else {
    discount = coupon.value;
  }

  return Math.min(discount, orderAmount);
}

export async function createOrderAtomic(
  env: Env,
  orderData: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_alternate_phone?: string;
    customer_email?: string;
    subtotal: number;
    grand_total: number;
    discount_amount?: number;
    shipping_amount?: number;
    coupon_code?: string;
    customer_note?: string;
  },
  items: Array<{
    product_id: number;
    product_name: string;
    variant_id?: number;
    variant_name?: string;
    sku?: string;
    quantity: number;
    mrp: number;
    selling_price: number;
    total_price: number;
    image_url?: string;
  }>,
  address: {
    flat_house: string;
    building_society?: string;
    street_locality: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  }
): Promise<number> {
  // Insert order
  const orderRes = await env.DB.prepare(`
    INSERT INTO orders (
      order_number, customer_name, customer_phone, customer_alternate_phone,
      customer_email, subtotal, discount_amount, coupon_code, shipping_amount,
      grand_total, order_status, payment_status, shipping_status, customer_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', 'not_shipped', ?)
  `)
    .bind(
      orderData.order_number,
      orderData.customer_name,
      orderData.customer_phone,
      orderData.customer_alternate_phone || null,
      orderData.customer_email || null,
      orderData.subtotal,
      orderData.discount_amount || 0,
      orderData.coupon_code || null,
      orderData.shipping_amount || 0,
      orderData.grand_total,
      orderData.customer_note || null
    )
    .run();

  const orderId = orderRes.meta.last_row_id as number;

  // Insert items and decrease stock
  for (const item of items) {
    await env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, variant_id, variant_name,
        sku, quantity, mrp, selling_price, total_price, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        orderId,
        item.product_id,
        item.product_name,
        item.variant_id || null,
        item.variant_name || null,
        item.sku || null,
        item.quantity,
        item.mrp,
        item.selling_price,
        item.total_price,
        item.image_url || null
      )
      .run();

    // Inventory reduction
    if (item.variant_id) {
      await env.DB.prepare(
        'UPDATE product_variants SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?'
      )
        .bind(item.quantity, item.variant_id)
        .run();
    }
    if (item.product_id) {
      await env.DB.prepare(
        'UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?'
      )
        .bind(item.quantity, item.product_id)
        .run();
    }
  }

  // Insert delivery address
  await env.DB.prepare(`
    INSERT INTO order_addresses (
      order_id, flat_house, building_society, street_locality, landmark,
      city, state, pincode, country
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      orderId,
      address.flat_house,
      address.building_society || null,
      address.street_locality,
      address.landmark || null,
      address.city,
      address.state,
      address.pincode,
      address.country || 'India'
    )
    .run();

  // Insert initial history
  await env.DB.prepare(`
    INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
    VALUES (?, 'order_status', 'none', 'new', 'Order created by customer')
  `)
    .bind(orderId)
    .run();

  // If coupon used, increment count
  if (orderData.coupon_code) {
    await env.DB.prepare(
      'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?'
    )
      .bind(orderData.coupon_code.toUpperCase())
      .run();
  }

  return orderId;
}

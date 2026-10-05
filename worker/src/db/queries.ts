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

function buildProductWhere(filters: ProductFilters): { where: string; params: (string | number)[] } {
  const conditions = ['is_active = 1'];
  const params: (string | number)[] = [];

  if (filters.category_id) {
    conditions.push('category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.brand_id) {
    conditions.push('brand_id = ?');
    params.push(filters.brand_id);
  }
  if (filters.min_price !== undefined) {
    conditions.push('selling_price >= ?');
    params.push(filters.min_price);
  }
  if (filters.max_price !== undefined) {
    conditions.push('selling_price <= ?');
    params.push(filters.max_price);
  }
  if (filters.is_featured) conditions.push('is_featured = 1');
  if (filters.is_bestseller) conditions.push('is_bestseller = 1');
  if (filters.is_new_arrival) conditions.push('is_new_arrival = 1');
  if (filters.is_offer) conditions.push('is_offer = 1');
  if (filters.age_group) {
    conditions.push('age_group = ?');
    params.push(filters.age_group);
  }

  return { where: conditions.join(' AND '), params };
}

export async function getProducts(
  env: Env,
  filters: ProductFilters,
  pagination: { offset: number; limit: number }
) {
  const { where, params: filterParams } = buildProductWhere(filters);
  let query = `SELECT products.*,
    (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) AS variant_count,
    (SELECT COUNT(*) FROM product_variants
     WHERE product_id = products.id AND is_available = 1 AND stock_quantity > 0) AS available_variant_count
    FROM products WHERE ${where}`;
  const params = [...filterParams];

  // Sorting
  switch (filters.sort) {
    case 'price_asc':
      query += ' ORDER BY selling_price ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY selling_price DESC';
      break;
    case 'rating':
      query += ` ORDER BY
        (SELECT AVG(rating) FROM reviews WHERE product_id = products.id AND is_approved = 1) DESC,
        (SELECT COUNT(*) FROM reviews WHERE product_id = products.id AND is_approved = 1) DESC,
        created_at DESC`;
      break;
    default:
      query += ' ORDER BY created_at DESC';
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(pagination.limit, pagination.offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return results;
}

export async function countProducts(env: Env, filters: ProductFilters): Promise<number> {
  const { where, params } = buildProductWhere(filters);
  const result = await env.DB.prepare(`SELECT COUNT(*) AS total FROM products WHERE ${where}`)
    .bind(...params)
    .first<{ total: number }>();
  return Number(result?.total || 0);
}

export async function getProductBySlug(env: Env, slug: string) {
  return env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
}

export async function validateCoupon(env: Env, code: string, orderAmount: number): Promise<number | null> {
  const coupon = await env.DB.prepare(
    `SELECT * FROM coupons
     WHERE code = ? AND is_active = 1
       AND (start_date IS NULL OR datetime(start_date) <= datetime('now'))
       AND (end_date IS NULL OR datetime(end_date) >= datetime('now'))
       AND (usage_limit IS NULL OR used_count < usage_limit)`
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
  },
  idempotencyKey: string,
  whatsappUrl: string,
): Promise<number> {
  const statements = [
    env.DB.prepare(`
    INSERT INTO orders (
      order_number, customer_name, customer_phone, customer_alternate_phone,
      customer_email, subtotal, discount_amount, coupon_code, shipping_amount,
      grand_total, order_status, payment_status, shipping_status, customer_note, whatsapp_link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', 'not_shipped', ?, ?)
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
      orderData.customer_note || null,
      whatsappUrl
      ),
    ...items.map((item) => env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, variant_id, variant_name,
        sku, quantity, mrp, selling_price, total_price, image_url
      ) SELECT id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        FROM orders WHERE order_number = ?
    `)
      .bind(
        item.product_id,
        item.product_name,
        item.variant_id || null,
        item.variant_name || null,
        item.sku || null,
        item.quantity,
        item.mrp,
        item.selling_price,
        item.total_price,
        item.image_url || null,
        orderData.order_number
      )),
    env.DB.prepare(`
    INSERT INTO order_addresses (
      order_id, flat_house, building_society, street_locality, landmark,
      city, state, pincode, country
    ) SELECT id, ?, ?, ?, ?, ?, ?, ?, ?
      FROM orders WHERE order_number = ?
  `)
      .bind(
      address.flat_house,
      address.building_society || null,
      address.street_locality,
      address.landmark || null,
      address.city,
      address.state,
      address.pincode,
      address.country || 'India',
      orderData.order_number
      ),
    env.DB.prepare(`
    INSERT INTO order_status_history (order_id, status_type, old_status, new_status, note)
    SELECT id, 'order_status', 'none', 'new', 'Order created by customer'
    FROM orders WHERE order_number = ?
  `)
      .bind(orderData.order_number),
    env.DB.prepare(`
    INSERT INTO order_idempotency_keys (idempotency_key, order_id, order_number)
    SELECT ?, id, order_number FROM orders WHERE order_number = ?
  `)
      .bind(idempotencyKey, orderData.order_number),
  ];

  const results = await env.DB.batch(statements);
  const orderId = Number(results[0]?.meta.last_row_id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error('Order batch completed without returning an order ID.');
  }
  return orderId;
}

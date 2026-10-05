import { Env } from '../types';

export interface CheckoutItemInput {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface CheckoutAddressInput {
  flat_house: string;
  building_society?: string;
  street_locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

interface ProductRecord {
  id: number;
  name: string;
  sku: string | null;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
}

interface VariantRecord {
  id: number;
  product_id: number;
  name: string | null;
  variant_type: string | null;
  variant_value: string | null;
  sku: string | null;
  mrp: number | null;
  selling_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_available: number;
}

interface CouponRecord {
  id: number;
  type: string;
  value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
}

interface ShippingRuleRecord {
  id: number;
  rule_type: string;
  name: string;
  state_name: string | null;
  pincode_prefix: string | null;
  min_order_value: number;
  max_order_value: number | null;
  shipping_amount: number;
  is_free: number;
  priority: number;
}

export interface PricedOrderItem extends CheckoutItemInput {
  product_name: string;
  variant_name?: string;
  sku?: string;
  mrp: number;
  selling_price: number;
  total_price: number;
  image_url?: string;
}

export interface CheckoutQuote {
  subtotal: number;
  discount: number;
  shipping: number | null;
  grand_total: number | null;
  shipping_rule: { id: number; name: string; rule_type: string } | null;
  items: Array<PricedOrderItem & { available_stock: number }>;
  warnings: string[];
}

export class CheckoutPricingError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = 'CheckoutPricingError';
  }
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

async function calculateDiscount(env: Env, code: string, subtotal: number): Promise<number> {
  const coupon = await env.DB.prepare(`
    SELECT id, type, value, min_order_value, max_discount, usage_limit, used_count
    FROM coupons
    WHERE code = ?
      AND is_active = 1
      AND (start_date IS NULL OR datetime(start_date) <= datetime('now'))
      AND (end_date IS NULL OR datetime(end_date) >= datetime('now'))
      AND (usage_limit IS NULL OR used_count < usage_limit)
  `)
    .bind(code.toUpperCase())
    .first<CouponRecord>();

  if (!coupon || subtotal < Number(coupon.min_order_value || 0)) {
    throw new CheckoutPricingError('This coupon is invalid, expired, or not eligible for your order.');
  }

  let discount: number;
  if (coupon.type === 'percentage') {
    discount = subtotal * Number(coupon.value) / 100;
    if (coupon.max_discount !== null) {
      discount = Math.min(discount, Number(coupon.max_discount));
    }
  } else if (coupon.type === 'flat') {
    discount = Number(coupon.value);
  } else {
    throw new CheckoutPricingError('This coupon has an unsupported discount type.');
  }

  return roundMoney(Math.min(Math.max(0, discount), subtotal));
}

async function resolveShippingRule(
  env: Env,
  subtotalAfterDiscount: number,
  state: string,
  pincode: string,
): Promise<{ amount: number; rule: CheckoutQuote['shipping_rule'] } | null> {
  const { results: rules } = await env.DB.prepare(`
    SELECT id, rule_type, name, state_name, pincode_prefix, min_order_value,
           max_order_value, shipping_amount, is_free, priority
    FROM shipping_rules
    WHERE is_active = 1
    ORDER BY priority DESC, id DESC
  `).all<ShippingRuleRecord>();

  const inRange = (rule: ShippingRuleRecord) =>
    subtotalAfterDiscount >= Number(rule.min_order_value || 0) &&
    (rule.max_order_value === null || subtotalAfterDiscount <= Number(rule.max_order_value));
  const selected =
    rules
      .filter((rule) => String(rule.pincode_prefix ?? '').trim() && pincode.startsWith(String(rule.pincode_prefix).trim()))
      .sort((a, b) =>
        String(b.pincode_prefix).length - String(a.pincode_prefix).length ||
        Number(b.priority) - Number(a.priority) ||
        b.id - a.id
      )[0] ||
    rules.find((rule) =>
      rule.rule_type === 'state' &&
      String(rule.state_name ?? '').trim().toLowerCase() === state.trim().toLowerCase() &&
      inRange(rule)
    ) ||
    rules
      .filter((rule) => rule.rule_type === 'free_threshold' && subtotalAfterDiscount >= Number(rule.min_order_value || 0))
      .sort((a, b) => Number(b.min_order_value) - Number(a.min_order_value) || Number(b.priority) - Number(a.priority))[0] ||
    rules.find((rule) => rule.rule_type === 'flat_rate' || rule.rule_type === 'default');

  if (!selected) return null;

  return {
    amount: Number(selected.is_free) ? 0 : roundMoney(Math.max(0, Number(selected.shipping_amount || 0))),
    rule: { id: selected.id, name: selected.name, rule_type: selected.rule_type },
  };
}

export async function calculateCheckoutQuote(
  env: Env,
  items: CheckoutItemInput[],
  address: CheckoutAddressInput,
  couponCode?: string,
): Promise<CheckoutQuote> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutPricingError('Your cart is empty.');
  }
  if (items.length > 50) {
    throw new CheckoutPricingError('An order can contain at most 50 distinct cart items.');
  }

  const pricedItems: CheckoutQuote['items'] = [];
  const groupedQuantities = new Map<string, number>();
  let subtotal = 0;

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      throw new CheckoutPricingError('Your cart contains an invalid item. Please refresh the cart and try again.');
    }
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    const variantId = item.variant_id ? Number(item.variant_id) : undefined;

    if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new CheckoutPricingError('Each item must include a valid product ID and whole-number quantity.');
    }

    const product = await env.DB.prepare(`
      SELECT id, name, sku, mrp, selling_price, stock_quantity
      FROM products WHERE id = ? AND is_active = 1
    `)
      .bind(productId)
      .first<ProductRecord>();

    if (!product) {
      throw new CheckoutPricingError('One of the selected products is no longer available.', 409);
    }

    let variant: VariantRecord | null = null;
    let stock = Number(product.stock_quantity || 0);
    if (variantId !== undefined) {
      variant = await env.DB.prepare(`
        SELECT id, product_id, name, variant_type, variant_value, sku, mrp,
               selling_price, stock_quantity, image_url, is_available
        FROM product_variants WHERE id = ? AND product_id = ?
      `)
        .bind(variantId, productId)
        .first<VariantRecord>();

      if (!variant || Number(variant.is_available) !== 1) {
        throw new CheckoutPricingError('The selected variant is unavailable. Please choose another option.', 409);
      }
      stock = Number(variant.stock_quantity || 0);
    } else {
      const variantCount = await env.DB.prepare(
        'SELECT COUNT(*) AS count FROM product_variants WHERE product_id = ?'
      )
        .bind(productId)
        .first<{ count: number }>();

      if (Number(variantCount?.count || 0) > 0) {
        throw new CheckoutPricingError(`Please select an option for ${product.name}.`);
      }
    }

    const groupKey = `${productId}:${variantId ?? 'base'}`;
    const requested = (groupedQuantities.get(groupKey) || 0) + quantity;
    groupedQuantities.set(groupKey, requested);
    if (requested > stock) {
      const available = Math.max(0, stock - requested + quantity);
      throw new CheckoutPricingError(
        available > 0
          ? `Only ${available} unit${available === 1 ? '' : 's'} remain for ${product.name}.`
          : `${product.name} is out of stock.`,
        409
      );
    }

    const sellingPrice = roundMoney(Number(variant?.selling_price ?? product.selling_price));
    const mrp = roundMoney(Number(variant?.mrp ?? product.mrp ?? sellingPrice));
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || !Number.isFinite(mrp) || mrp < 0) {
      throw new CheckoutPricingError(`${product.name} has invalid pricing. Please contact TOY WORLD.`);
    }
    const totalPrice = roundMoney(sellingPrice * quantity);
    subtotal = roundMoney(subtotal + totalPrice);
    const variantName = variant
      ? [variant.variant_type, variant.variant_value || variant.name].filter(Boolean).join(': ')
      : undefined;

    pricedItems.push({
      product_id: productId,
      variant_id: variantId,
      quantity,
      product_name: product.name,
      variant_name: variantName,
      sku: variant?.sku || product.sku || undefined,
      mrp,
      selling_price: sellingPrice,
      total_price: totalPrice,
      image_url: variant?.image_url || undefined,
      available_stock: stock,
    });
  }

  const discount = couponCode?.trim()
    ? await calculateDiscount(env, couponCode.trim(), subtotal)
    : 0;
  const subtotalAfterDiscount = roundMoney(Math.max(0, subtotal - discount));
  const shippingResult = await resolveShippingRule(
    env,
    subtotalAfterDiscount,
    String(address.state || ''),
    String(address.pincode || ''),
  );
  const shipping = shippingResult?.amount ?? null;

  return {
    subtotal,
    discount,
    shipping,
    grand_total: shipping === null ? null : roundMoney(subtotalAfterDiscount + shipping),
    shipping_rule: shippingResult?.rule ?? null,
    items: pricedItems,
    warnings: shippingResult ? [] : ['Shipping will be confirmed manually by TOY WORLD via WhatsApp.'],
  };
}

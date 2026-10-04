// ============================================================
// TOY WORLD — WhatsApp Integration Service
// ============================================================

interface OrderItem {
  product_name: string;
  variant_name?: string;
  sku?: string;
  quantity: number;
  selling_price: number;
  total_price: number;
  image_url?: string;
}

interface Address {
  flat_house: string;
  building_society?: string;
  street_locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

interface Order {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_alternate_phone?: string;
  customer_email?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_amount: number;
  grand_total: number;
  customer_note?: string;
  created_at?: string;
}

const WHATSAPP_NUMBER = '919416217374';

/**
 * Generate a complete, formatted WhatsApp order message
 */
export function generateOrderMessage(order: Order, items: OrderItem[], address: Address): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const timeStr = now.toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  let msg = `🧸 *TOY WORLD ORDER*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `📋 *Order ID:* ${order.order_number}\n`;
  msg += `📅 *Date:* ${dateStr} at ${timeStr}\n\n`;

  msg += `👤 *CUSTOMER DETAILS*\n`;
  msg += `Name: ${order.customer_name}\n`;
  msg += `Mobile: ${order.customer_phone}\n`;
  if (order.customer_alternate_phone) {
    msg += `Alt Mobile: ${order.customer_alternate_phone}\n`;
  }
  if (order.customer_email) {
    msg += `Email: ${order.customer_email}\n`;
  }
  msg += `\n`;

  msg += `📍 *DELIVERY ADDRESS*\n`;
  msg += `${address.flat_house}\n`;
  if (address.building_society) msg += `${address.building_society}\n`;
  msg += `${address.street_locality}\n`;
  if (address.landmark) msg += `Near: ${address.landmark}\n`;
  msg += `${address.city}, ${address.state} - ${address.pincode}\n`;
  msg += `${address.country || 'India'}\n\n`;

  msg += `🛒 *ORDER ITEMS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  items.forEach((item, index) => {
    msg += `\n${index + 1}. *${item.product_name}*\n`;
    if (item.variant_name) msg += `   Variant: ${item.variant_name}\n`;
    if (item.sku) msg += `   SKU: ${item.sku}\n`;
    msg += `   Qty: ${item.quantity} × ₹${item.selling_price.toFixed(2)}\n`;
    msg += `   Total: ₹${item.total_price.toFixed(2)}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Subtotal: ₹${order.subtotal.toFixed(2)}\n`;
  if (order.discount_amount > 0) {
    msg += `Discount`;
    if (order.coupon_code) msg += ` (${order.coupon_code})`;
    msg += `: -₹${order.discount_amount.toFixed(2)}\n`;
  }
  msg += `Shipping: ${order.shipping_amount === 0 ? 'FREE' : `₹${order.shipping_amount.toFixed(2)}`}\n`;
  msg += `*Grand Total: ₹${order.grand_total.toFixed(2)}*\n\n`;

  if (order.customer_note) {
    msg += `📝 *Customer Note:* ${order.customer_note}\n\n`;
  }

  msg += `💳 *PAYMENT*\n`;
  msg += `Payment will be coordinated manually via WhatsApp.\n`;
  msg += `Please share payment confirmation after payment.\n\n`;

  msg += `Thank you for shopping with *TOY WORLD*! 🎉\n`;
  msg += `We will confirm your order shortly.`;

  return msg;
}

/**
 * Build WhatsApp click-to-chat URL with URL-encoded message
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Build WhatsApp URL for order (combines generate + build)
 */
export function buildOrderWhatsAppUrl(order: Order, items: OrderItem[], address: Address): string {
  const message = generateOrderMessage(order, items, address);
  return buildWhatsAppUrl(message);
}

/**
 * Build WhatsApp URL for admin to contact customer
 */
export function buildCustomerContactUrl(orderNumber: string, customerPhone: string): string {
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const phone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const message = `Hello! This is TOY WORLD regarding your order ${orderNumber}. How can we help you?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

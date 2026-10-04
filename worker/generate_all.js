const fs = require('fs');
const path = require('path');

const baseDir = "C:\\Users\\JFO\\Documents\\antigravity\\proud-heisenberg\\toy-world\\worker";

const files = {
  "src/index.ts": `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { Env } from './types';

import adminRoutes from './routes/admin/index';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import settingsRoutes from './routes/settings';
import categoryRoutes from './routes/categories';
import searchRoutes from './routes/search';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import brandRoutes from './routes/brands';
import integrationsRoutes from './routes/integrations';

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
app.use('*', cors());

app.route('/api/admin', adminRoutes);
app.route('/api/products', productRoutes);
app.route('/api/categories', categoryRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/coupons', couponRoutes);
app.route('/api/reviews', reviewRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/brands', brandRoutes);
app.route('/api/integrations', integrationsRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
`,
  "src/middleware/auth.ts": `import { SignJWT, jwtVerify } from 'jose';
import { Context, Next } from 'hono';

export async function generateToken(userId: number, username: string, role: string, secret: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
}

export async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (e) {
    return null;
  }
}

export const adminAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token, c.env.ADMIN_JWT_SECRET);
  if (!payload || payload.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('adminUser', payload);
  await next();
};
`,
  "src/middleware/rateLimit.ts": `import { Context, Next } from 'hono';

export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    
    // Clean old entries
    await c.env.DB.prepare(\`DELETE FROM rate_limit_log WHERE request_time < datetime('now', '-\${windowMs/1000} seconds')\`).run();
    
    // Count current
    const { count } = await c.env.DB.prepare('SELECT count(*) as count FROM rate_limit_log WHERE ip_address = ?')
      .bind(ip).first();
      
    if (count >= maxRequests) {
      return c.json({ error: 'Too Many Requests' }, 429);
    }
    
    await c.env.DB.prepare('INSERT INTO rate_limit_log (ip_address) VALUES (?)').bind(ip).run();
    
    await next();
  };
}
`,
  "src/utils/helpers.ts": `export function generateOrderNumber(): string {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return \`TW-\${dateStr}-\${randomStr}\`;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function validateIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

export function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\\d{9}$/.test(phone);
}

export function paginate(page: number, limit: number) {
  return { offset: (page - 1) * limit, limit };
}
`,
  "src/services/whatsapp.ts": `export function generateOrderMessage(order: any, items: any[], address: any): string {
  let msg = \`*Order Confirmation - Toy World*\\n\\n\`;
  msg += \`Hi \${order.customer_name},\\n\`;
  msg += \`Thank you for your order!\\n\\n\`;
  msg += \`*Order Number:* \${order.order_number}\\n\`;
  msg += \`*Total Amount:* ₹\${order.grand_total}\\n\\n\`;
  msg += \`*Items:*\\n\`;
  for(let item of items) {
    msg += \`- \${item.product_name} x\${item.quantity} = ₹\${item.total_price}\\n\`;
  }
  msg += \`\\n*Delivery Address:*\\n\`;
  msg += \`\${address.flat_house}, \${address.street_locality}\\n\`;
  msg += \`\${address.city}, \${address.state} - \${address.pincode}\\n\\n\`;
  msg += \`We will notify you once your order is shipped.\\n\`;
  return msg;
}

export function buildWhatsAppUrl(message: string): string {
  const phone = '919416217374';
  return \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
}
`,
  "src/services/sheets.ts": `export async function syncOrderToSheets(order: any, env: any): Promise<void> {
  try {
    const { results: settings } = await env.DB.prepare("SELECT value FROM store_settings WHERE key = 'google_sheets_url'").all();
    if (!settings.length) return;
    const url = settings[0].value;
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    });
    
    await env.DB.prepare('UPDATE orders SET sheets_synced = 1 WHERE id = ?').bind(order.id).run();
  } catch(e) {
    console.error("Sheets sync failed", e);
  }
}
`,
  "src/routes/products.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const page = Number(c.req.query('page') || 1);
  const limit = Number(c.req.query('limit') || 20);
  const offset = (page - 1) * limit;
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE is_active = 1 LIMIT ? OFFSET ?')
    .bind(limit, offset).all();
  return c.json({ data: results, page, limit });
});

app.get('/featured', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE is_active = 1 AND is_featured = 1 LIMIT 10').all();
  return c.json(results);
});

app.get('/bestsellers', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE is_active = 1 AND is_bestseller = 1 LIMIT 10').all();
  return c.json(results);
});

app.get('/new-arrivals', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE is_active = 1 AND is_new_arrival = 1 LIMIT 10').all();
  return c.json(results);
});

app.get('/offers', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE is_active = 1 AND is_offer = 1 LIMIT 10').all();
  return c.json(results);
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const product = await c.env.DB.prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1').bind(slug).first();
  if (!product) return c.json({ error: 'Product not found' }, 404);
  
  const { results: variants } = await c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ?').bind(product.id).all();
  const { results: images } = await c.env.DB.prepare('SELECT * FROM product_images WHERE product_id = ?').bind(product.id).all();
  
  return c.json({ ...product, variants, images });
});

export default app;
`,
  "src/routes/categories.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order').all();
  return c.json(results);
});

app.get('/tree', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order').all();
  return c.json(results); // In real app, format to tree structure
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const cat = await c.env.DB.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first();
  if (!cat) return c.json({ error: 'Not found' }, 404);
  const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE category_id = ? AND is_active = 1').bind(cat.id).all();
  return c.json({ category: cat, products });
});

export default app;
`,
  "src/routes/orders.ts": `import { Hono } from 'hono';
import { Env } from '../types';
import { generateOrderNumber } from '../utils/helpers';
import { generateOrderMessage, buildWhatsAppUrl } from '../services/whatsapp';
import { syncOrderToSheets } from '../services/sheets';

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  const body = await c.req.json();
  const orderNum = generateOrderNumber();
  
  const orderIdRes = await c.env.DB.prepare(
    'INSERT INTO orders (order_number, customer_name, customer_phone, subtotal, grand_total, order_status) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(orderNum, body.customer_name, body.customer_phone, body.subtotal, body.grand_total, 'pending').run();
  
  const orderId = orderIdRes.meta.last_row_id;
  
  await c.env.DB.prepare(
    'INSERT INTO order_addresses (order_id, flat_house, street_locality, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(orderId, body.address.flat_house, body.address.street_locality, body.address.city, body.address.state, body.address.pincode).run();
  
  for (const item of body.items) {
    await c.env.DB.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, quantity, mrp, selling_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(orderId, item.product_id, item.product_name, item.quantity, item.mrp, item.selling_price, item.total_price).run();
  }
  
  const orderObj = { order_number: orderNum, customer_name: body.customer_name, grand_total: body.grand_total };
  const msg = generateOrderMessage(orderObj, body.items, body.address);
  const waUrl = buildWhatsAppUrl(msg);
  
  await c.env.DB.prepare('UPDATE orders SET whatsapp_link = ? WHERE id = ?').bind(waUrl, orderId).run();
  
  c.executionCtx.waitUntil(syncOrderToSheets({ ...orderObj, id: orderId }, c.env));
  
  return c.json({ success: true, order_number: orderNum, order_id: orderId, whatsapp_url: waUrl, grand_total: body.grand_total });
});

app.get('/:orderNumber', async (c) => {
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_number = ?').bind(c.req.param('orderNumber')).first();
  if(!order) return c.json({error: 'Not found'}, 404);
  return c.json(order);
});

export default app;
`,
  "src/routes/settings.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/store', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM store_settings').all();
  const settings = results.reduce((acc: any, row: any) => ({...acc, [row.key]: row.value}), {});
  return c.json(settings);
});

app.get('/shipping', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM shipping_rules WHERE is_active = 1').all();
  return c.json(results);
});

app.get('/homepage/config', async (c) => {
  const { results: banners } = await c.env.DB.prepare('SELECT * FROM homepage_banners WHERE is_active = 1').all();
  const { results: sections } = await c.env.DB.prepare('SELECT * FROM homepage_sections WHERE is_active = 1').all();
  return c.json({ banners, sections });
});

app.get('/pages/:slug', async (c) => {
  const page = await c.env.DB.prepare('SELECT * FROM page_content WHERE slug = ? AND is_active = 1').bind(c.req.param('slug')).first();
  if(!page) return c.json({error: 'Not found'}, 404);
  return c.json(page);
});

export default app;
`,
  "src/routes/admin/index.ts": `import { Hono } from 'hono';
import { Env } from '../../types';
import { adminAuth, generateToken } from '../../middleware/auth';
import { hashPassword, verifyPassword } from '../../utils/helpers';

const app = new Hono<{ Bindings: Env }>();

app.post('/auth/login', async (c) => {
  const { username, password } = await c.req.json();
  const user = await c.env.DB.prepare('SELECT * FROM admin_users WHERE username = ? AND active = 1').bind(username).first();
  if (!user || !(await verifyPassword(password, user.password_hash as string))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  const token = await generateToken(user.id as number, user.username as string, user.role as string, c.env.ADMIN_JWT_SECRET);
  return c.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.use('*', adminAuth);

app.get('/auth/me', (c) => {
  return c.json(c.get('adminUser'));
});

app.get('/dashboard/stats', async (c) => {
  const { count: orders } = await c.env.DB.prepare('SELECT count(*) as count FROM orders').first() as {count: number};
  const { total: revenue } = await c.env.DB.prepare('SELECT sum(grand_total) as total FROM orders WHERE payment_status = ?').bind('paid').first() as {total: number};
  return c.json({ orders, revenue: revenue || 0 });
});

app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  if (file && file instanceof File) {
    const key = \`uploads/\${Date.now()}-\${file.name}\`;
    await c.env.R2.put(key, await file.arrayBuffer());
    return c.json({ url: \`https://r2.toyworld.in/\${key}\` }); // Dummy URL
  }
  return c.json({ error: 'No file' }, 400);
});

export default app;
`,
  "src/routes/integrations.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.post('/sheets/sync', async (c) => {
  const secret = c.req.header('X-Webhook-Secret');
  if (secret !== c.env.GOOGLE_SHEETS_WEBHOOK_SECRET) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  // Update order in D1
  if (data.order_number) {
    await c.env.DB.prepare('UPDATE orders SET order_status = ?, payment_status = ?, shipping_status = ?, tracking_number = ? WHERE order_number = ?')
      .bind(data.order_status, data.payment_status, data.shipping_status, data.tracking_number, data.order_number).run();
  }
  return c.json({ success: true });
});

export default app;
`,
  "src/routes/search.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE name LIKE ? AND is_active = 1').bind(\`%\${q}%\`).all();
  return c.json({ data: results });
});

app.get('/suggestions', async (c) => {
  const q = c.req.query('q') || '';
  const { results } = await c.env.DB.prepare('SELECT name FROM products WHERE name LIKE ? LIMIT 5').bind(\`%\${q}%\`).all();
  return c.json(results.map((r: any) => r.name));
});

export default app;
`,
  "src/routes/coupons.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.post('/validate', async (c) => {
  const { code, orderAmount } = await c.req.json();
  const coupon = await c.env.DB.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').bind(code).first();
  if(!coupon) return c.json({ error: 'Invalid coupon' }, 400);
  // Simple validation logic
  return c.json({ success: true, discount: coupon.value, type: coupon.type });
});

export default app;
`,
  "src/routes/reviews.ts": `import { Hono } from 'hono';
import { Env } from '../types';
import { rateLimiter } from '../middleware/rateLimit';

const app = new Hono<{ Bindings: Env }>();

app.post('/', rateLimiter(5, 60000), async (c) => {
  const body = await c.req.json();
  const ip = c.req.header('CF-Connecting-IP') || '';
  await c.env.DB.prepare('INSERT INTO reviews (product_id, customer_name, rating, title, body, ip_address) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(body.product_id, body.customer_name, body.rating, body.title, body.body, ip).run();
  return c.json({ success: true });
});

app.get('/product/:productId', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1').bind(c.req.param('productId')).all();
  return c.json(results);
});

export default app;
`,
  "src/routes/brands.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM brands WHERE is_active = 1 ORDER BY display_order').all();
  return c.json(results);
});

export default app;
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}
console.log("TypeScript source files updated.");

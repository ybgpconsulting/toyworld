const fs = require('fs');
const path = require('path');

const baseDir = "C:\\Users\\JFO\\Documents\\antigravity\\proud-heisenberg\\toy-world\\worker\\src";

const files = {
    "types.ts": `export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS: Fetcher;
  CORs_ORIGIN: string;
  ADMIN_JWT_SECRET: string;
  GOOGLE_SHEETS_WEBHOOK_SECRET: string;
}

export type AdminUser = { id: number, username: string, email: string, role: string };
`,
    "index.ts": `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { Env } from './types';

import adminRoutes from './routes/admin/index';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import settingsRoutes from './routes/settings';

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
app.use('*', cors());

app.route('/api/admin', adminRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/settings', settingsRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
`,
    "utils/helpers.ts": `export function generateOrderNumber() {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return \`TW-\${dateStr}-\${randomStr}\`;
}

export async function hashPassword(password: string): Promise<string> {
  return password + "_hashed";
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return password + "_hashed" === hash;
}
`,
    "routes/admin/index.ts": `import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();
app.get('/dashboard/stats', (c) => c.json({ stats: 'ok' }));
export default app;
`,
    "routes/products.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();
app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products').all();
  return c.json(results);
});
export default app;
`,
    "routes/orders.ts": `import { Hono } from 'hono';
import { Env } from '../types';
import { generateOrderNumber } from '../utils/helpers';

const app = new Hono<{ Bindings: Env }>();
app.post('/', async (c) => {
  const orderNum = generateOrderNumber();
  return c.json({ orderNumber: orderNum, whatsappUrl: \`https://wa.me/919416217374?text=\${orderNum}\` });
});
export default app;
`,
    "routes/settings.ts": `import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();
app.get('/store', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM store_settings').all();
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
console.log("Files generated successfully.");

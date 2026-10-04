import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { Env, Variables } from './types';

// Routes
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import searchRoutes from './routes/search';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import settingsRoutes from './routes/settings';
import brandRoutes from './routes/brands';
import integrationsRoutes from './routes/integrations';

// Admin routes
import adminAuthRoutes from './routes/admin/auth';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminProductRoutes from './routes/admin/products';
import adminCategoryRoutes from './routes/admin/categories';
import adminOrderRoutes from './routes/admin/orders';
import adminUploadRoutes from './routes/admin/upload';
import adminReviewRoutes from './routes/admin/reviews';
import adminCouponRoutes from './routes/admin/coupons';
import adminShippingRoutes from './routes/admin/shipping';
import adminSettingsRoutes from './routes/admin/settings';
import adminHomepageRoutes from './routes/admin/homepage';

import sitemapService from './services/sitemap';
import { adminAuth } from './middleware/auth';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', secureHeaders());
app.use('*', cors());

// Public API
app.route('/api/products', productRoutes);
app.route('/api/categories', categoryRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/coupons', couponRoutes);
app.route('/api/reviews', reviewRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/shipping-rules', settingsRoutes); // Alias
app.route('/api/homepage', settingsRoutes); // Alias for homepage config
app.route('/api/brands', brandRoutes);
app.route('/api/integrations', integrationsRoutes);

// Sitemap & XML
app.route('/', sitemapService);

// Admin Auth (both /api/admin/auth and direct /api/admin/login)
app.route('/api/admin/auth', adminAuthRoutes);
app.route('/api/admin', adminAuthRoutes); // Handles /api/admin/login and /api/admin/me

// Admin protected group
const adminApp = new Hono<{ Bindings: Env; Variables: Variables }>();
adminApp.use('*', adminAuth);
adminApp.route('/dashboard', adminDashboardRoutes);
adminApp.route('/products', adminProductRoutes);
adminApp.route('/categories', adminCategoryRoutes);
adminApp.route('/orders', adminOrderRoutes);
adminApp.route('/upload', adminUploadRoutes);
adminApp.route('/reviews', adminReviewRoutes);
adminApp.route('/coupons', adminCouponRoutes);
adminApp.route('/shipping', adminShippingRoutes);
adminApp.route('/shipping-rules', adminShippingRoutes); // Alias
adminApp.route('/settings', adminSettingsRoutes);
adminApp.route('/homepage', adminHomepageRoutes);
adminApp.route('/brands', brandRoutes); // Admin brands

app.route('/api/admin', adminApp);

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;

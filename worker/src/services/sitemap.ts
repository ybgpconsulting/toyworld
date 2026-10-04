import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/sitemap.xml', async (c) => {
  const { results: products } = await c.env.DB.prepare(
    'SELECT slug, updated_at FROM products WHERE is_active = 1'
  ).all<{ slug: string; updated_at: string }>();

  const { results: categories } = await c.env.DB.prepare(
    'SELECT slug, updated_at FROM categories WHERE is_active = 1'
  ).all<{ slug: string; updated_at: string }>();

  const baseUrl = 'https://toyworld.in';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/shipping-policy',
    '/payment-policy',
    '/return-policy',
    '/cancellation-policy',
    '/privacy-policy',
    '/terms',
  ];

  for (const route of staticRoutes) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route}</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  // Category routes
  for (const cat of categories) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  }

  // Product routes
  for (const prod of products) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/product/${prod.slug}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return c.text(xml, 200, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600',
  });
});

export default app;

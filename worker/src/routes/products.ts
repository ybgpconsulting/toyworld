import { Hono } from 'hono';
import { Env } from '../types';
import { getProducts, getProductBySlug } from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const page = Number(c.req.query('page') || 1);
  const limit = Number(c.req.query('limit') || 20);
  const offset = (page - 1) * limit;
  
  const filters: any = {};
  if (c.req.query('category_slug')) {
    const cat = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(c.req.query('category_slug')).first();
    if (cat) filters.category_id = cat.id;
  }
  if (c.req.query('brand_id')) filters.brand_id = Number(c.req.query('brand_id'));
  if (c.req.query('min_price')) filters.min_price = Number(c.req.query('min_price'));
  if (c.req.query('max_price')) filters.max_price = Number(c.req.query('max_price'));
  if (c.req.query('is_featured')) filters.is_featured = true;
  if (c.req.query('is_bestseller')) filters.is_bestseller = true;
  if (c.req.query('is_new_arrival')) filters.is_new_arrival = true;
  if (c.req.query('is_offer')) filters.is_offer = true;

  const results = await getProducts(c.env, filters, { limit, offset });
  return c.json({ data: results, page, limit });
});

app.get('/featured', async (c) => {
  const results = await getProducts(c.env, { is_featured: true }, { limit: 10, offset: 0 });
  return c.json(results);
});

app.get('/bestsellers', async (c) => {
  const results = await getProducts(c.env, { is_bestseller: true }, { limit: 10, offset: 0 });
  return c.json(results);
});

app.get('/new-arrivals', async (c) => {
  const results = await getProducts(c.env, { is_new_arrival: true }, { limit: 10, offset: 0 });
  return c.json(results);
});

app.get('/offers', async (c) => {
  const results = await getProducts(c.env, { is_offer: true }, { limit: 10, offset: 0 });
  return c.json(results);
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const product = await getProductBySlug(c.env, slug);
  if (!product) return c.json({ error: 'Product not found' }, 404);
  
  const { results: variants } = await c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ?').bind(product.id).all();
  const { results: images } = await c.env.DB.prepare('SELECT * FROM product_images WHERE product_id = ?').bind(product.id).all();
  
  return c.json({ ...product, variants, images });
});

export default app;

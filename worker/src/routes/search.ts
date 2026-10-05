import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const q = c.req.query('q')?.trim() || '';
  const page = Math.max(1, Number(c.req.query('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') || 20)));
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params: (string | number)[] = [];

  if (q) {
    query += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ? OR short_description LIKE ?)';
    const searchPattern = `%${q}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (c.req.query('category_id')) {
    query += ' AND category_id = ?';
    params.push(Number(c.req.query('category_id')));
  }
  if (c.req.query('brand_id')) {
    query += ' AND brand_id = ?';
    params.push(Number(c.req.query('brand_id')));
  }
  if (c.req.query('min_price')) {
    query += ' AND selling_price >= ?';
    params.push(Number(c.req.query('min_price')));
  }
  if (c.req.query('max_price')) {
    query += ' AND selling_price <= ?';
    params.push(Number(c.req.query('max_price')));
  }

  // Count total matching
  const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
  const countRes = await c.env.DB.prepare(countQuery)
    .bind(...params)
    .first<{ total: number }>();

  // Add order and pagination
  query = query.replace(
    'SELECT *',
    `SELECT products.*,
      (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) AS variant_count,
      (SELECT COUNT(*) FROM product_variants
       WHERE product_id = products.id AND is_available = 1 AND stock_quantity > 0) AS available_variant_count`
  );
  query += ' ORDER BY is_bestseller DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    data: results,
    total: countRes?.total || 0,
    page,
    limit,
    totalPages: Math.ceil((countRes?.total || 0) / limit),
  });
});

app.get('/suggestions', async (c) => {
  const q = c.req.query('q')?.trim() || '';
  if (!q || q.length < 2) {
    return c.json([]);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT name FROM products WHERE is_active = 1 AND name LIKE ? LIMIT 6'
  )
    .bind(`%${q}%`)
    .all<{ name: string }>();

  return c.json(results.map((r) => r.name));
});

export default app;

import { Hono } from 'hono';
import { Env } from '../../types';
import { slugify } from '../../utils/helpers';

const app = new Hono<{ Bindings: Env }>();

// List all products with search & pagination
app.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') || 20)));
  const offset = (page - 1) * limit;
  const search = c.req.query('search')?.trim();
  const categoryId = c.req.query('category_id');

  let query = 'SELECT p.*, c.name as category_name, b.name as brand_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id WHERE 1=1';
  const params: (string | number)[] = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    query += ' AND p.category_id = ?';
    params.push(Number(categoryId));
  }

  const countQuery = query.replace('SELECT p.*, c.name as category_name, b.name as brand_name', 'SELECT count(*) as total');
  const countRes = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({
    data: results,
    total: countRes?.total || 0,
    page,
    limit,
  });
});

// Single product
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  if (!product) return c.json({ error: 'Product not found' }, 404);

  const { results: variants } = await c.env.DB.prepare(
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC'
  ).bind(id).all();

  const { results: images } = await c.env.DB.prepare(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC'
  ).bind(id).all();

  return c.json({ ...product, variants, images });
});

// Create product
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const res = await c.env.DB.prepare(`
      INSERT INTO products (
        name, slug, sku, category_id, brand_id, short_description, description,
        specifications, age_group, material, gender, mrp, selling_price,
        discount_percentage, is_active, is_featured, is_bestseller, is_new_arrival,
        is_offer, stock_quantity, low_stock_threshold, seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      slug,
      body.sku || null,
      body.category_id || null,
      body.brand_id || null,
      body.short_description || null,
      body.description || null,
      typeof body.specifications === 'object' ? JSON.stringify(body.specifications) : body.specifications || null,
      body.age_group || null,
      body.material || null,
      body.gender || null,
      body.mrp || 0,
      body.selling_price || 0,
      body.discount_percentage || 0,
      body.is_active ? 1 : 0,
      body.is_featured ? 1 : 0,
      body.is_bestseller ? 1 : 0,
      body.is_new_arrival ? 1 : 0,
      body.is_offer ? 1 : 0,
      body.stock_quantity || 0,
      body.low_stock_threshold || 5,
      body.seo_title || null,
      body.seo_description || null
    ).run();

    const productId = res.meta.last_row_id;

    // Handle variants
    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        await c.env.DB.prepare(`
          INSERT INTO product_variants (product_id, name, sku, mrp, selling_price, stock_quantity, variant_type, variant_value)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          productId,
          v.name || '',
          v.sku || null,
          v.mrp || body.mrp || 0,
          v.selling_price || body.selling_price || 0,
          v.stock_quantity || 0,
          v.variant_type || 'default',
          v.variant_value || v.name || ''
        ).run();
      }
    }

    return c.json({ success: true, id: productId });
  } catch (err: unknown) {
    console.error('Create product error:', err);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product
app.patch('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        category_id = COALESCE(?, category_id),
        brand_id = COALESCE(?, brand_id),
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description),
        specifications = COALESCE(?, specifications),
        age_group = COALESCE(?, age_group),
        mrp = COALESCE(?, mrp),
        selling_price = COALESCE(?, selling_price),
        discount_percentage = COALESCE(?, discount_percentage),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured),
        is_bestseller = COALESCE(?, is_bestseller),
        is_new_arrival = COALESCE(?, is_new_arrival),
        is_offer = COALESCE(?, is_offer),
        stock_quantity = COALESCE(?, stock_quantity),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name ?? null,
      body.sku ?? null,
      body.category_id ?? null,
      body.brand_id ?? null,
      body.short_description ?? null,
      body.description ?? null,
      typeof body.specifications === 'object' ? JSON.stringify(body.specifications) : (body.specifications ?? null),
      body.age_group ?? null,
      body.mrp ?? null,
      body.selling_price ?? null,
      body.discount_percentage ?? null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : null,
      body.is_bestseller !== undefined ? (body.is_bestseller ? 1 : 0) : null,
      body.is_new_arrival !== undefined ? (body.is_new_arrival ? 1 : 0) : null,
      body.is_offer !== undefined ? (body.is_offer ? 1 : 0) : null,
      body.stock_quantity ?? null,
      body.low_stock_threshold ?? null,
      id
    ).run();

    return c.json({ success: true });
  } catch (err: unknown) {
    console.error('Update product error:', err);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM product_variants WHERE product_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM product_images WHERE product_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

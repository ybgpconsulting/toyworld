import { Hono } from 'hono';
import { Env } from '../../types';
import { slugify } from '../../utils/helpers';

const app = new Hono<{ Bindings: Env }>();

// Get all categories
app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT c.*, p.name as parent_name,
    (SELECT count(*) FROM products WHERE category_id = c.id) as product_count
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    ORDER BY c.display_order ASC, c.name ASC
  `).all();
  return c.json(results);
});

// Create category
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const res = await c.env.DB.prepare(`
      INSERT INTO categories (name, slug, description, image_url, parent_id, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      slug,
      body.description || null,
      body.image_url || null,
      body.parent_id ? Number(body.parent_id) : null,
      body.display_order || 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
    ).run();

    return c.json({ success: true, id: res.meta.last_row_id });
  } catch (err: unknown) {
    console.error('Create category error:', err);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category
app.patch('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        parent_id = ?,
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name ?? null,
      body.description ?? null,
      body.image_url ?? null,
      body.parent_id !== undefined ? (body.parent_id ? Number(body.parent_id) : null) : null,
      body.display_order ?? null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      id
    ).run();

    return c.json({ success: true });
  } catch (err: unknown) {
    console.error('Update category error:', err);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await c.env.DB.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

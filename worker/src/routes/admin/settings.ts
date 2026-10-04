import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM store_settings').all<{ key: string; value: string }>();
  const settings = results.reduce((acc: Record<string, string>, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});
  return c.json(settings);
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json<Record<string, string>>();
    for (const [key, value] of Object.entries(body)) {
      await c.env.DB.prepare(`
        INSERT INTO store_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
      `).bind(key, String(value ?? '')).run();
    }
    return c.json({ success: true });
  } catch (err) {
    console.error('Update settings error:', err);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

export default app;

import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();
app.get('/dashboard/stats', (c) => c.json({ stats: 'ok' }));
export default app;

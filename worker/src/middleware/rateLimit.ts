import { Context, Next } from 'hono';
import { Env } from '../types';

export const rateLimiter = (maxRequests = 60, windowMs = 60000) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      const ip =
        c.req.header('CF-Connecting-IP') ||
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        '127.0.0.1';

      const windowStart = new Date(Date.now() - windowMs).toISOString();
      const now = new Date().toISOString();

      // Clean up older records
      await c.env.DB.prepare('DELETE FROM rate_limit_log WHERE request_time < ?')
        .bind(windowStart)
        .run();

      const countResult = await c.env.DB.prepare(
        'SELECT count(*) as count FROM rate_limit_log WHERE ip_address = ? AND request_time >= ?'
      )
        .bind(ip, windowStart)
        .first<{ count: number }>();

      if (countResult && countResult.count >= maxRequests) {
        return c.json(
          { error: 'Too many requests. Please slow down and try again later.' },
          429
        );
      }

      await c.env.DB.prepare(
        'INSERT INTO rate_limit_log (ip_address, request_time) VALUES (?, ?)'
      )
        .bind(ip, now)
        .run();
    } catch (e) {
      console.warn('Rate limiter error:', e);
    }
    await next();
  };
};

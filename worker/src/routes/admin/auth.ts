import { Hono } from 'hono';
import { Env, Variables } from '../../types';
import { generateToken, verifyToken } from '../../middleware/auth';
import { verifyPassword, hashPassword } from '../../utils/helpers';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.post('/setup', async (c) => {
  try {
    const { username, password, email, name } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    if (String(password).length < 12) {
      return c.json({ error: 'Password must be at least 12 characters long' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, username, password_hash, email, name, role, active FROM admin_users WHERE username = ?'
    )
      .bind(username)
      .first<{
        id: number;
        username: string;
        password_hash: string;
        email: string;
        name: string | null;
        role: string;
        active: number;
      }>();

    if (!user) {
      return c.json({ error: 'Admin user not found' }, 404);
    }

    if (user.password_hash !== 'SETUP_REQUIRED' && !user.password_hash.startsWith('TODO')) {
      return c.json({ error: 'Admin password is already configured' }, 409);
    }

    const newHash = await hashPassword(String(password));
    await c.env.DB.prepare(
      'UPDATE admin_users SET password_hash = ?, email = COALESCE(?, email), name = COALESCE(?, name), active = 1 WHERE id = ?'
    )
      .bind(newHash, email || user.email, name || user.name, user.id)
      .run();

    return c.json({ success: true, message: 'Admin password configured successfully' });
  } catch (err) {
    console.error('Admin setup error:', err);
    return c.json({ error: 'Admin setup failed' }, 500);
  }
});

app.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE username = ? AND active = 1'
    )
      .bind(username)
      .first<{
        id: number;
        username: string;
        password_hash: string;
        role: string;
      }>();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (user.password_hash === 'SETUP_REQUIRED' || user.password_hash.startsWith('TODO')) {
      return c.json({ error: 'Admin password has not been configured. Use /api/admin/auth/setup first.' }, 403);
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const secret = c.env.ADMIN_JWT_SECRET || 'default-secret-change-in-prod';
    const token = await generateToken(user.id, user.username, user.role, secret);

    return c.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token, c.env.ADMIN_JWT_SECRET || 'default-secret-change-in-prod');
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  return c.json(payload);
});

export default app;

import { Hono } from 'hono';
import { Env, Variables } from '../../types';
import { generateToken, verifyToken } from '../../middleware/auth';
import { verifyPassword, hashPassword } from '../../utils/helpers';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

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

    let isValid = false;

    // Handle initial setup mode or standard password check
    if (
      user.password_hash === 'SETUP_REQUIRED' ||
      user.password_hash.startsWith('TODO')
    ) {
      // Allow default password 'ToyWorld@2024' on first login and automatically hash it
      if (password === 'ToyWorld@2024') {
        isValid = true;
        const newHash = await hashPassword(password);
        await c.env.DB.prepare(
          'UPDATE admin_users SET password_hash = ? WHERE id = ?'
        )
          .bind(newHash, user.id)
          .run();
      }
    } else {
      isValid = await verifyPassword(password, user.password_hash);
    }

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

import { SignJWT, jwtVerify } from 'jose';
import { Context, Next } from 'hono';
import { Env, Variables } from '../types';

export async function generateToken(userId: number, username: string, role: string, secret: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(secret));
}

export async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as unknown as { userId: number; username: string; role: string };
  } catch {
    return null;
  }
}

export const adminAuth = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or malformed token' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token, c.env.ADMIN_JWT_SECRET || 'default-secret-change-in-prod');
  if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
    return c.json({ error: 'Unauthorized: Invalid permissions' }, 401);
  }
  c.set('adminUser', payload);
  await next();
};

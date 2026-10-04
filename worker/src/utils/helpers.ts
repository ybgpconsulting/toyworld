// ============================================================
// TOY WORLD — Helper Utilities for Cloudflare Worker
// ============================================================

/**
 * Generate a unique order number in format: TW-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const dateParts = formatter.formatToParts(d);
  const year = dateParts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = dateParts.find((part) => part.type === 'month')?.value ?? '00';
  const day = dateParts.find((part) => part.type === 'day')?.value ?? '00';
  const dateStr = `${year}${month}${day}`;
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TW-${dateStr}-${randomStr}`;
}

/**
 * Hash a password using PBKDF2 via Web Crypto API (Cloudflare Workers compatible)
 * Returns: base64(salt):base64(hash)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return `pbkdf2:${saltB64}:${hashB64}`;
}

/**
 * Verify a password against a stored PBKDF2 hash
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (!stored || !stored.startsWith('pbkdf2:')) {
      return false;
    }
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const saltB64 = parts[1];
    const expectedHashB64 = parts[2];
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    const computedHashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
    return computedHashB64 === expectedHashB64;
  } catch {
    return false;
  }
}

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
  const normalized = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate Indian pincode (6 digits, cannot start with 0)
 */
export function validateIndianPincode(pincode: string): boolean {
  const normalized = String(pincode ?? '').replace(/\D/g, '');
  return /^[1-9]\d{5}$/.test(normalized);
}

/**
 * Validate Indian mobile number (10 digits, starts with 6-9)
 * Accepts common user-entered formats such as +91, spaces, and dashes.
 */
export function validateIndianPhone(phone: string): boolean {
  const normalized = String(phone ?? '').replace(/\D/g, '');

  if (normalized.length === 10) {
    return /^[6-9]\d{9}$/.test(normalized);
  }

  if (normalized.length === 12 && normalized.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(normalized.slice(2));
  }

  return false;
}

/**
 * Get pagination offset from page number and limit
 */
export function paginate(page: number, limit: number): { offset: number; limit: number } {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  return { offset: (safePage - 1) * safeLimit, limit: safeLimit };
}

/**
 * Get client IP from Cloudflare request headers
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'unknown'
  );
}

/**
 * Sanitize a string for safe use in responses
 */
export function sanitizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.trim().slice(0, 10000);
}

/**
 * Format price to Indian rupee display
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(mrp: number, sellingPrice: number): number {
  if (mrp <= 0 || sellingPrice >= mrp) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

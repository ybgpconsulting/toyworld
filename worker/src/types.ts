export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS?: Fetcher;
  CORS_ORIGIN?: string;
  ADMIN_JWT_SECRET: string;
  GOOGLE_SHEETS_WEBHOOK_SECRET?: string;
  GOOGLE_SHEETS_SCRIPT_URL?: string;
}

export type Variables = {
  adminUser?: {
    userId: number;
    username: string;
    role: string;
  };
};

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

//server\user-service\src\config\env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRY: z.string().regex(/^\d+[mhd]$/, 'Invalid expiry format (use 15m, 1h, 7d)').default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().regex(/^\d+[mhd]$/, 'Invalid expiry format (use 15m, 1h, 7d)').default('7d'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  
  // CORS & Frontend
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',').map(o => o.trim())),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  
  // Services
  INTERNAL_SERVICE_TOKEN: z.string().min(32),
  RESEND_API_KEY: z.string().min(1),
  
  // OAuth (optional in dev)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  
  // Admin (for seeding only)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_USERNAME: z.string().min(3).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;

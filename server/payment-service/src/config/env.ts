import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3003'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  INTERNAL_SERVICE_TOKEN: z.string().min(32),

  // Service URLs
  USER_SERVICE_URL: z.string().url(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID_DEFAULT: z.string().optional(),
  STRIPE_PRICE_ID_IN: z.string().optional(),
  STRIPE_PRICE_ID_SEA: z.string().optional(),
  STRIPE_PRICE_ID_GLOBAL: z.string().optional(),
  STRIPE_PRICE_ID_EU: z.string().optional(),
  STRIPE_PRICE_ID_JP: z.string().optional(),
  STRIPE_PRICE_ID_ME: z.string().optional(),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;


import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3004'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  INTERNAL_SERVICE_TOKEN: z.string().min(32),

  // Service URLs
  USER_SERVICE_URL: z.string().url(),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

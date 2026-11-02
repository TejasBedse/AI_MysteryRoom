import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const projectRootEnv = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
dotenv.config({ path: process.env.ENV_FILE || projectRootEnv });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).refine(value => /^mongodb(?:\+srv)?:\/\//.test(value), 'MONGODB_URI must start with mongodb:// or mongodb+srv://'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_TEXT_MODEL: z.string().default('gemini-3.5-flash-lite'),
  GEMINI_FALLBACK_TEXT_MODEL: z.string().default('gemini-3.8-flash'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  CASE_TOKEN_SECRET: z.string().min(24).default('development-only-change-me-before-deploy'),
  SCENARIO_MAX_LENGTH: z.coerce.number().int().positive().default(2000),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(180000),
  AI_RETRIES: z.coerce.number().int().min(0).max(3).default(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
});
export const env = envSchema.parse(process.env);
if (process.env.NODE_ENV === 'production' && env.CASE_TOKEN_SECRET === 'development-only-change-me-before-deploy') {
  throw new Error('CASE_TOKEN_SECRET must be set to a unique value in production.');
}

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  CLIENT_URL: z.string().url(),
  BASICAUTH_USERNAME: z.string(),
  BASICAUTH_PASSWORD: z.string(),
  ALGORITHMS_EASY: z.string(),
  ALGORITHMS_HARD: z.string(),
  FORENSICS_EASY: z.string(),
  FORENSICS_HARD: z.string(),
  GRAPHICS_EASY: z.string(),
  GRAPHICS_HARD: z.string(),
  HACKING_EASY: z.string(),
  HACKING_HARD: z.string(),
  LOGIC_EASY: z.string(),
  LOGIC_HARD: z.string(),
  PUZZLE_EASY: z.string(),
  PUZZLE_HARD: z.string(),
});

export const env = envSchema.parse(process.env);

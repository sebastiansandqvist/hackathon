import { z } from 'zod';

const envSchema = z.object({
  PUZZLE_EASY_ANSWER: z.string(),
  PUZZLE_HARD_ANSWER: z.string(),
  HACKING_HARD_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);

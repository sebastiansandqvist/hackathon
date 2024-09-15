import { z } from 'zod';

const envSchema = z.object({
  ALGORITHMS_EASY: z.string(),
  ALGORITHMS_HARD: z.string(),
  FORENSICS_EASY: z.string(),
  FORENSICS_HARD: z.string(),
  HACKING_EASY: z.string(),
  HACKING_HARD: z.string(),
  LOGIC_EASY: z.string(),
  LOGIC_HARD: z.string(),
  PUZZLE_EASY: z.string(),
  PUZZLE_HARD: z.string(),
});

export const env = envSchema.parse(process.env);

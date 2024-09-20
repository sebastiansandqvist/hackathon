import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, authedProcedure } from '../../trpc';
import { env } from '../../env';
import { db } from '../../db';
import { createLimiter } from '../../ratelimit';

// 10 guesses per minute, per user
const rateLimiter = createLimiter({ limit: 10, windowDuration: 60 * 1000 });

export const sideQuestRouter = router({
  hackThePublicMessage: authedProcedure
    .input(z.object({ password: z.string(), text: z.string() }))
    .mutation(({ input, ctx }) => {
      const { limited, retryAfter } = rateLimiter(ctx.user.id);
      if (limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `rate limit exceeded! retry in ${Math.floor((retryAfter ?? 0) / 1000)}s`,
        });
      }

      const password = 'supersecretlol';
      if (input.password !== password) {
        throw new Error('ACCESS DENIED');
      }
      if (!ctx.user.sideQuests.hacking.easy) {
        ctx.user.sideQuests.hacking.easy = Date.now();
      }

      db.publicMessages.push({
        createdAt: Date.now(),
        userId: ctx.user.id,
        text: input.text,
      });
    }),
  hackThePublicMessageImage: authedProcedure
    .input(z.object({ password: z.string(), imageUrl: z.string() }))
    .mutation(({ input, ctx }) => {
      const { limited, retryAfter } = rateLimiter(ctx.user.id);
      if (limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `rate limit exceeded! retry in ${Math.floor((retryAfter ?? 0) / 1000)}s`,
        });
      }

      if (input.password !== env.HACKING_HARD) {
        throw new Error('ACCESS DENIED');
      }
      if (!ctx.user.sideQuests.hacking.hard) {
        ctx.user.sideQuests.hacking.hard = Date.now();
      }

      db.publicMessages.push({
        createdAt: Date.now(),
        userId: ctx.user.id,
        imgUrl: input.imageUrl,
        text: '',
      });
    }),
  submitSolution: authedProcedure
    .input(
      z.object({
        category: z.enum(['algorithms', 'forensics', 'graphics', 'hacking', 'logic', 'puzzles']),
        difficulty: z.enum(['easy', 'hard']),
        solution: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const { limited, retryAfter } = rateLimiter(ctx.user.id);
      if (limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `rate limit exceeded! retry in ${Math.floor((retryAfter ?? 0) / 1000)}s`,
        });
      }

      const solution = {
        algorithms: { easy: env.ALGORITHMS_EASY, hard: env.ALGORITHMS_HARD },
        forensics: { easy: env.FORENSICS_EASY, hard: env.FORENSICS_HARD },
        graphics: { easy: env.GRAPHICS_EASY, hard: env.GRAPHICS_HARD },
        hacking: { easy: env.HACKING_EASY, hard: env.HACKING_HARD },
        logic: { easy: env.LOGIC_EASY, hard: env.LOGIC_HARD },
        puzzles: { easy: env.PUZZLE_EASY, hard: env.PUZZLE_HARD },
      };
      if (input.solution !== solution[input.category][input.difficulty]) {
        throw new Error('incorrect');
      }
      ctx.user.sideQuests[input.category][input.difficulty] = Date.now();
    }),
});

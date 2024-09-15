import { z } from 'zod';
import { router, authedProcedure } from '../../trpc';
import { env } from '../../env';
import { createDocument } from 'domino';
import { db } from '../../db';

export const sideQuestRouter = router({
  hackThePublicMessage: authedProcedure
    .input(z.object({ password: z.string(), text: z.string() }))
    .mutation(({ input, ctx }) => {
      const redHerring = '1350';
      if (input.password === redHerring) {
        return { redirect: 'https://en.wikipedia.org/wiki/Red_herring' };
      }

      const password = 'supersecretlol';
      if (input.password !== password && input.password !== env.HACKING_HARD_PASSWORD) {
        throw new Error('Incorrect password');
      }
      if (!ctx.user.sideQuests.hacking.easy) {
        ctx.user.sideQuests.hacking.easy = Date.now();
      }

      const doc = createDocument(input.text);
      const img = doc.querySelector('img');
      let imgUrl: string | undefined;
      let text = input.text;

      if (img) {
        if (input.password !== env.HACKING_HARD_PASSWORD) {
          throw new Error('Incorrect hard-mode password');
        }
        if (img.src) {
          if (!ctx.user.sideQuests.hacking.hard) {
            ctx.user.sideQuests.hacking.hard = Date.now();
          }
          imgUrl = img.src;
          text = doc.body.textContent ?? text;
        }
      }

      db.publicMessages.push({
        createdAt: Date.now(),
        userId: ctx.user.id, // convert this to the anonymous name to be displayed on the homepage as "you've been hacked by <anon>"
        imgUrl,
        text,
      });
    }),
  submitPuzzle: authedProcedure
    .input(
      z.object({
        difficulty: z.enum(['easy', 'hard']),
        solution: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const solution = {
        easy: env.PUZZLE_EASY_ANSWER,
        hard: env.PUZZLE_HARD_ANSWER,
      };
      if (input.solution !== solution[input.difficulty]) {
        throw new Error('Incorrect');
      }
      ctx.user.sideQuests.puzzles[input.difficulty] = Date.now();
    }),
  submitSolution: authedProcedure
    .input(
      z.object({
        category: z.enum(['algorithms', 'forensics', 'hacking', 'logic', 'puzzles']),
        difficulty: z.enum(['easy', 'hard']),
        solution: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const solution = {
        algorithms: {
          easy: 'TODO',
          hard: 'TODO',
        },
        forensics: {
          easy: 'TODO',
          hard: 'TODO',
        },
        hacking: {
          easy: 'TODO',
          hard: 'TODO',
        },
        logic: {
          easy: 'TODO',
          hard: 'TODO',
        },
        puzzles: {
          easy: env.PUZZLE_EASY_ANSWER,
          hard: env.PUZZLE_HARD_ANSWER,
        },
      };
      if (input.solution !== solution[input.category][input.difficulty]) {
        throw new Error('Incorrect');
      }
      ctx.user.sideQuests[input.category][input.difficulty] = Date.now();
    }),
});

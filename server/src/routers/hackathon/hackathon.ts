import { z } from 'zod';
import { authedProcedure, publicProcedure, router } from '../../trpc';
import { db } from '../../db';

export const hackathonRouter = router({
  homepage: publicProcedure.query(() => {
    const message = db.publicMessages.at(-1)!;
    return {
      foodGame: db.foodGame,
      times: db.times,
      // TODO: make these dynamic
      checkpoints: {
        current: 'codingStart',
        next: 'codingEnd',
      },
      visibleSections: db.visibleSections,
      publicMessage: {
        text: message.text,
        imgUrl: message.imgUrl,
        author: db.users.find((user) => user.id === message.userId)?.username,
      },
      // sideQuestStandings: db.sideQuestStandings
      //   .map((standing) => ({
      //     user: db.users.find((user) => user.id === standing.userId)?.anonymousName ?? 'anonymous',
      //     hacking: standing.hacking,
      //     logic: standing.logic,
      //     algorithms: standing.algorithms,
      //   }))
      //   .toSorted((a, b) => countCompletedSideQuests(b) - countCompletedSideQuests(a)),
    };
  }),
  revealHomepageSection: publicProcedure // TODO: make authed
    .input(z.object({ section: z.string() }))
    .mutation(({ input }) => {
      db.visibleSections.push(input.section);
    }),
  updateFoodGame: authedProcedure
    .input(
      z.object({
        title: z.string(),
        items: z.string().array(),
      }),
    )
    .mutation(({ input, ctx }) => {
      // TODO: figure out how to log in the tv user
      // if (ctx.user.username !== 'tv') throw new Error('Only the TV can participate');
      db.foodGame.title = input.title;
      db.foodGame.items = input.items;
    }),
});

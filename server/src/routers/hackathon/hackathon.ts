import { z } from 'zod';
import { publicProcedure, router } from '../../trpc';
import { db } from '../../db';

export const hackathonRouter = router({
  homepage: publicProcedure.query(() => {
    const message = db.publicMessages.at(-1)!;
    return {
      times: db.times,
      nextCheckpoint: {
        name: 'Start coding',
        time: db.times.codingStart,
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
});

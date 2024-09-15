import { z } from 'zod';
import { authedProcedure, publicProcedure, router } from '../../trpc';
import { db } from '../../db';

function calculateCheckpoints() {
  const checkpoints = Object.entries(db.times).map(
    ([checkpoint, time], index) => ({ checkpoint, time, index }) as const,
  );

  const currentCheckpoint =
    checkpoints.findLast(({ time }) => {
      return new Date(time).getTime() < Date.now();
    }) ?? checkpoints[0]!;

  const nextCheckpoint = checkpoints[currentCheckpoint.index + 1];

  return {
    current: currentCheckpoint.checkpoint as keyof typeof db.times,
    next: nextCheckpoint?.checkpoint as keyof typeof db.times | undefined,
  };
}

export const hackathonRouter = router({
  homepage: publicProcedure.query(() => {
    const message = db.publicMessages.at(-1)!;
    const sideQuestProgress = db.users.map((user) => ({
      id: user.id,
      anonymousName: user.anonymousName,
      progress: user.sideQuests,
    }));
    return {
      foodGame: db.foodGame,
      times: db.times,
      checkpoints: calculateCheckpoints(),
      visibleSections: db.visibleSections,
      publicMessage: {
        text: message.text,
        imgUrl: message.imgUrl,
        author: db.users.find((user) => user.id === message.userId)?.anonymousName,
      },
      sideQuestProgress,
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
      if (ctx.user.username !== 'tv') throw new Error('Only the TV can participate');
      db.foodGame.title = input.title;
      db.foodGame.items = input.items;
    }),
});

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
    };
  }),
  revealHomepageSection: authedProcedure.input(z.object({ section: z.string() })).mutation(({ input }) => {
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
      if (ctx.user.username !== 'tv') throw new Error('only the TV can participate');
      db.foodGame.title = input.title;
      db.foodGame.items = input.items;
    }),
  possibleContributors: authedProcedure.query(({ ctx }) => {
    return db.users
      .filter((user) => user.username !== 'tv' && user.id !== ctx.user.id)
      .map((user) => ({
        id: user.id,
        username: user.username,
      }));
  }),
  submitOrUpdateProject: authedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        contributors: z.string().array(),
        repoUrl: z.string(),
        hostedUrl: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const project = db.projects.find((project) => project.createdBy === ctx.user.id);
      if (db.projects.find((project) => project.name === input.name)) {
        throw new Error(`the name "${input.name}" is already taken`);
      }

      if (project) {
        project.name = input.name;
        project.description = input.description;
        project.contributors = input.contributors;
        project.repoUrl = input.repoUrl;
        project.hostedUrl = input.hostedUrl;
        return;
      }

      db.projects.push({
        id: crypto.randomUUID(),
        createdBy: ctx.user.id,
        contributors: input.contributors,
        repoUrl: input.repoUrl,
        hostedUrl: input.hostedUrl,
        name: input.name,
        description: input.description,
        votes: [],
      });
    }),
  loadProjectsForVoting: authedProcedure.query(({ ctx }) => {
    return db.projects
      .filter((project) => project.createdBy !== ctx.user.id && !project.contributors.includes(ctx.user.id))
      .map((project) => ({
        id: project.id,
        name: project.name,
        repoUrl: project.repoUrl, // TODO: should this be included or no?
        hostedUrl: project.hostedUrl,
        description: project.description,
        createdBy: db.users.find((user) => user.id === project.createdBy)?.username ?? '???',
        contributors: project.contributors.map((id) => db.users.find((user) => user.id === id)?.username ?? '???'),
      }));
  }),
  submitOrUpdateVote: authedProcedure
    .input(
      z.object({
        creativity: z.string().array(),
        experience: z.string().array(),
        technicalMerit: z.string().array(),
      }),
    )
    .mutation(({ input, ctx }) => {
      (['creativity', 'experience', 'technicalMerit'] as const).forEach((category) => {
        input[category].forEach((projectId, i, rankings) => {
          const project = db.projects.find((p) => p.id === projectId);
          if (!project) {
            console.error(`!!! project ${projectId} not found`);
            return;
          }
          const points = rankings.length - i;
          const existingVote = project.votes.find((vote) => vote.userId === ctx.user.id);
          if (existingVote) {
            existingVote.points[category] = points;
            return;
          }
          project.votes.push({
            userId: ctx.user.id,
            points: {
              creativity: 0,
              experience: 0,
              technicalMerit: 0,
              [category]: points,
            },
          });
        });
      });
    }),
  results: publicProcedure.query(() => {
    // TODO: if coding/voting is still underway, throw an error. no spoilers!

    const mostPerfectUsernames = db.users
      .toSorted((a, b) => b.renameCounter - a.renameCounter)
      .map((user) => ({
        username: user.username,
        anonymousName: user.anonymousName,
        renameCounter: user.renameCounter,
      }));

    const messageUpdateCounts = db.publicMessages.reduce<Record<string, number>>((acc, message) => {
      acc[message.userId] = (acc[message.userId] ?? 0) + 1;
      return acc;
    }, {});

    const mostMessageUpdates = Object.entries(messageUpdateCounts).map(([userId, count]) => ({
      username: db.users.find((user) => user.id === userId)?.username ?? '???',
      count,
    }));

    const sideQuestProgress = db.users
      .map((user) => ({
        username: user.username,
        progress: user.sideQuests,
        deductions: user.hintDeductions,
        totalPointsBeforeDeductions: [
          user.sideQuests.algorithms.easy ? 1 : 0,
          user.sideQuests.algorithms.hard ? 2 : 0,
          user.sideQuests.forensics.easy ? 1 : 0,
          user.sideQuests.forensics.hard ? 2 : 0,
          user.sideQuests.hacking.easy ? 1 : 0,
          user.sideQuests.hacking.hard ? 2 : 0,
          user.sideQuests.logic.easy ? 1 : 0,
          user.sideQuests.logic.hard ? 2 : 0,
          user.sideQuests.puzzles.easy ? 1 : 0,
          user.sideQuests.puzzles.hard ? 2 : 0,
        ].reduce((acc, value) => acc + value, 0),
      }))
      .toSorted((a, b) => {
        const aPoints = a.totalPointsBeforeDeductions - a.deductions;
        const bPoints = b.totalPointsBeforeDeductions - b.deductions;
        return bPoints - aPoints;
      });

    const bigBoys = db.users.filter((user) => user.sideQuests.algorithms.bigboy).map((user) => user.username);

    const projects = db.projects.map((project) => ({
      ...project,
      createdBy: db.users.find((user) => user.id === project.createdBy)?.username ?? '???',
      contributors: project.contributors.map((id) => db.users.find((user) => user.id === id)?.username ?? '???'),
      votes: project.votes.reduce(
        (acc, vote) => {
          acc.creativity += vote.points.creativity;
          acc.experience += vote.points.experience;
          acc.technicalMerit += vote.points.technicalMerit;
          acc.total += vote.points.creativity + vote.points.experience + vote.points.technicalMerit;
          return acc;
        },
        { total: 0, creativity: 0, experience: 0, technicalMerit: 0 },
      ),
    }));

    return { mostPerfectUsernames, mostMessageUpdates, sideQuestProgress, bigBoys, projects };
  }),
});

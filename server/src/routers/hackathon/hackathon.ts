import { z } from 'zod';
import { authedProcedure, basicAuthedProcedure, maybeAuthedProcedure, publicProcedure, router } from '../../trpc';
import { db } from '../../db';
import { nanoid } from '../../util';
import type { SideQuests } from '../../types';

function calculateCheckpoints() {
  const checkpoints = Object.entries(db.times)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([checkpoint, time], index) => ({ checkpoint, time, index }) as const);

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

function sumSideQuestProgress(sideQuests: SideQuests) {
  const sum = [
    sideQuests.algorithms.easy ? 1 : 0,
    sideQuests.algorithms.hard ? 2 : 0,
    sideQuests.forensics.easy ? 1 : 0,
    sideQuests.forensics.hard ? 2 : 0,
    sideQuests.graphics.easy ? 1 : 0,
    sideQuests.graphics.hard ? 2 : 0,
    sideQuests.hacking.easy ? 1 : 0,
    sideQuests.hacking.hard ? 2 : 0,
    sideQuests.logic.easy ? 1 : 0,
    sideQuests.logic.hard ? 2 : 0,
    sideQuests.puzzles.easy ? 1 : 0,
    sideQuests.puzzles.hard ? 2 : 0,
  ].reduce((a, b) => a + b, 0);
  return sum;
}

const rootRoute = '';
export const hackathonRouter = router({
  [rootRoute]: publicProcedure.query(() => ({
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    users: db.users.length,
    projects: db.projects.length,
    client: process.env.CLIENT_URL,
  })),
  homepage: maybeAuthedProcedure.query(({ ctx }) => {
    const message = db.publicMessages.at(-1)!;
    const sideQuestProgress = db.users
      .map((user) => ({
        id: user.id,
        anonymousName: user.anonymousName,
        progress: user.sideQuests,
        hintDeductions: user.hintDeductions,
      }))
      .toSorted(
        (a, b) =>
          sumSideQuestProgress(b.progress) - b.hintDeductions - sumSideQuestProgress(a.progress) - a.hintDeductions,
      );
    const themeSuggestions = db.users
      .filter((user) => ctx.user?.id !== user.id)
      .map((user) => user.themeSuggestions[user.themeSuggestions.length - 1])
      .filter((suggestion): suggestion is Exclude<typeof suggestion, undefined> => !!suggestion);

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
      theme: db.theme,
      themes: [...db.themeIdeas, ...themeSuggestions],
      ownSuggestion: ctx.user ? ctx.user.themeSuggestions[ctx.user.themeSuggestions.length - 1] : undefined,
    };
  }),
  revealHomepageSection: authedProcedure.input(z.object({ section: z.string() })).mutation(({ input }) => {
    db.visibleSections.push(input.section);
  }),
  suggestTheme: authedProcedure.input(z.object({ theme: z.string() })).mutation(({ input, ctx }) => {
    ctx.user.themeSuggestions.push(input.theme);
  }),
  rankThemes: authedProcedure.input(z.object({ themes: z.array(z.string()) })).mutation(({ input, ctx }) => {
    ctx.user.themeRankings.length = 0;
    ctx.user.themeRankings.push(...input.themes);
  }),
  lockInTheme: authedProcedure.mutation(({ input, ctx }) => {
    if (ctx.user.username !== 'tv') throw new Error('only the TV can lock in the theme');

    const themeVotes: Record<string, number> = {};
    for (const { themeRankings } of db.users) {
      const len = themeRankings.length;
      themeRankings.forEach((theme, i) => {
        const points = len - i;
        themeVotes[theme] = (themeVotes[theme] ?? 0) + points;
      });
    }

    const mostVotedTheme = Object.entries(themeVotes).toSorted(([themeA, pointsA], [themeB, pointsB]) => {
      return pointsB - pointsA;
    })[0]![0];

    db.theme = mostVotedTheme;

    return mostVotedTheme;
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
      const otherProjects = db.projects.filter((p) => p.id !== project?.id);

      if (otherProjects.find((project) => project.name === input.name)) {
        throw new Error(`the name "${input.name}" is already taken`);
      }

      if (project) {
        project.name = input.name;
        project.description = input.description;
        project.contributors = input.contributors;
        project.repoUrl = input.repoUrl;
        project.hostedUrl = input.hostedUrl;
        return { id: project.id };
      }

      let id = nanoid(6);
      while (db.projects.find((project) => project.id === id)) {
        id = nanoid(6);
      }

      db.projects.push({
        id,
        createdBy: ctx.user.id,
        contributors: input.contributors,
        repoUrl: input.repoUrl,
        hostedUrl: input.hostedUrl,
        name: input.name,
        description: input.description,
        votes: [],
      });
      return { id };
    }),
  loadProjectsForVoting: authedProcedure.query(({ ctx }) => {
    return {
      projects: db.projects
        .filter((project) => project.createdBy !== ctx.user.id && !project.contributors.includes(ctx.user.id))
        .map((project) => ({
          id: project.id,
          name: project.name,
        })),
      yourProjects: db.projects
        .filter((project) => project.createdBy === ctx.user.id)
        .map((project) => ({
          id: project.id,
          name: project.name,
        })),
    };
  }),
  listProjects: publicProcedure.query(() => {
    return db.projects
      .map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdBy: db.users.find((user) => user.id === project.createdBy)?.username ?? '???',
        contributors: project.contributors.map((id) => db.users.find((user) => user.id === id)?.username ?? '???'),
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));
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
    // TODO: chat stats?

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
          user.sideQuests.graphics.easy ? 1 : 0,
          user.sideQuests.graphics.hard ? 2 : 0,
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

    const projects = db.projects
      .map((project) => ({
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
      }))
      .toSorted((a, b) => b.votes.total - a.votes.total);

    return {
      times: db.times,
      mostPerfectUsernames,
      mostMessageUpdates,
      sideQuestProgress,
      projects,
    };
  }),
  loadSubmitProjectPage: authedProcedure.query(({ ctx }) => {
    const result = {
      you: ctx.user.username,
      others: db.users
        .filter((user) => user.username !== 'tv' && user.id !== ctx.user.id)
        .map((user) => ({
          id: user.id,
          username: user.username,
        })),
      project: null,
    };

    const project = db.projects.find((project) => project.createdBy === ctx.user.id);
    if (!project) return result;
    return {
      ...result,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        contributors: project.contributors,
        repoUrl: project.repoUrl,
        hostedUrl: project.hostedUrl,
      },
    };
  }),
  projectById: maybeAuthedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    const project = db.projects.find((project) => project.id === input.id);
    if (!project) throw new Error('not found');
    const canEdit = ctx.user && project.createdBy === ctx.user.id;
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdBy: db.users.find((user) => user.id === project.createdBy)?.username ?? '???',
      contributors: project.contributors.map((id) => db.users.find((user) => user.id === id)?.username ?? '???'),
      repoUrl: project.repoUrl,
      hostedUrl: project.hostedUrl,
      canEdit,
    };
  }),
  db: basicAuthedProcedure.query(() => db),
});

import { z } from 'zod';
import { db } from '../../db';
import { pickRandom } from '../../util';
import { router, maybeAuthedProcedure, publicProcedure, authedProcedure } from '../../trpc';

function cookie(sessionId: string) {
  return `Session-Id=${sessionId}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; Path=/; SameSite=Strict`;
}

function generateUsername() {
  const adjectives = ['10x', 'full-stack', 'smelly', 'failed', 'well-meaning', 'bold', 'jaded', 'sleepless', 'righteous', 'caffeinated', 'talented', 'handsome', 'noble', 'brave', 'functioning', 'tireless', 'passionate', 'loyal', 'honest', 'senior', 'elegant', 'hard-working']; // prettier-ignore
  const programmingLanguages = ['HTML', 'JavaScript', 'leetcode', 'TypeScript', 'Java', 'AI', 'crypto', 'Python', 'Rust', 'HTML', 'PHP', 'Ruby', 'OOP', 'functional programming', 'Assembly'] // prettier-ignore
  const character = ['programmer', 'engineer', 'hacker', 'sysadmin', 'gigachad', 'repairman', 'influencer', 'firefighter', 'archaeologist', 'intern', 'mechanic', 'professor', 'debugger', 'devotee', 'addict', 'webmaster', 'salesman', 'coder', 'engineer', 'monk', 'evangelist', 'developer', 'researcher', 'student', 'administrator', 'entrepreneur', 'investor', 'disciple', 'artisan', 'janitor']; // prettier-ignore
  return `${pickRandom(adjectives)} ${pickRandom(programmingLanguages)} ${pickRandom(character)}`;
}

for (let i = 0; i < 10; i++) {
  console.log(generateUsername());
}

export const authRouter = router({
  status: maybeAuthedProcedure.query(({ ctx }) => {
    if ('user' in ctx) {
      const user = ctx.user!;
      return {
        isAuthed: true as const,
        username: user.username,
        anonymousName: user.anonymousName,
        sideQuests: user.sideQuests,
        hintDeductions: user.hintDeductions,
      };
    }
    return { isAuthed: false as const };
  }),
  authenticate: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = db.users.find((user) => user.username === input.username);
      const sessionId = crypto.randomUUID();

      // if a user exists, try to sign in
      if (user) {
        if (!(await Bun.password.verify(input.password, user.password))) {
          throw new Error('Incorrect password');
        }
        user.sessions.push({ id: sessionId, created: Date.now() });
        if (user.sessions.length > 3) user.sessions.shift(); // support up to 3 concurrent sessions
        ctx.res.setHeader('Set-Cookie', cookie(sessionId));
        return;
      }

      // otherwise, create a new user
      db.users.push({
        id: crypto.randomUUID(),
        username: input.username,
        anonymousName: generateUsername(),
        password: await Bun.password.hash(input.password),
        sessions: [{ id: sessionId, created: Date.now() }],
        renameCounter: 0,
        hintDeductions: 0,
        sideQuests: {
          algorithms: { easy: null, hard: null },
          forensics: { easy: null, hard: null },
          graphics: { easy: null, hard: null },
          hacking: { easy: null, hard: null },
          logic: { easy: null, hard: null },
          puzzles: { easy: null, hard: null },
        },
      });
      ctx.res.setHeader('Set-Cookie', cookie(sessionId));
      return { foo: 'bar' };
    }),
  signOut: authedProcedure.mutation(({ ctx }) => {
    ctx.user.sessions = ctx.user.sessions.filter((session) => session.id !== ctx.sessionId);
    ctx.res.setHeader('Set-Cookie', 'Session-Id=; Max-Age=0; HttpOnly; Path=/');
  }),
  changeAnonUsername: authedProcedure.mutation(({ ctx }) => {
    const anonymousName = generateUsername();
    ctx.user.anonymousName = anonymousName;
    ctx.user.renameCounter++;
    return anonymousName;
  }),
});

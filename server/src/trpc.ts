import { initTRPC } from '@trpc/server';
import { db } from './db';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import type { IncomingMessageWithBody } from '@trpc/server/adapters/node-http';

export const createContext = ({ info, req, res }: CreateHTTPContextOptions) => {
  return { info, req, res };
};

type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const merge = t.mergeRouters;

function parseCookie(cookie: string) {
  return cookie.split('; ').reduce<Record<string, string>>((acc, row) => {
    const [key, value] = row.split('=');
    acc[key] = value;
    return acc;
  }, {});
}

function getUserFromCookie(req: IncomingMessageWithBody) {
  const cookie = req.headers.cookie;
  if (!cookie) throw new Error('Missing cookie');
  const sessionId = parseCookie(cookie)['Session-Id'];
  if (!sessionId) throw new Error('Missing session ID');
  const user = db.users.find((user) => user.sessions.find((session) => session.id === sessionId));
  if (!user) throw new Error('Unauthorized');
  return { user, sessionId };
}

export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { user, sessionId } = getUserFromCookie(ctx.req);
  return next({ ctx: { user, sessionId } });
});

export const maybeAuthedProcedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    const { user, sessionId } = getUserFromCookie(ctx.req);
    return next({ ctx: { user, sessionId } });
  } catch (err) {
    return next();
  }
});

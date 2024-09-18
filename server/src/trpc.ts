import { initTRPC } from '@trpc/server';
import { db } from './db';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import type { IncomingMessageWithBody } from '@trpc/server/adapters/node-http';
import type { User } from './types';

const t = initTRPC.context<Context>().create();

const logger = t.middleware(async ({ ctx, path, next }) => {
  const start = Date.now();
  const result = await next();
  const timestamp = new Date(start)
    .toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(',', '');
  if (ctx.user) {
    console.log(`${timestamp} – ${path} - ${(Date.now() - start).toLocaleString()}ms (${ctx.user.username})`);
  } else {
    console.log(`${timestamp} – ${path} - ${(Date.now() - start).toLocaleString()}ms (anon)`);
  }
  return result;
});

export const createContext = ({ info, req, res }: CreateHTTPContextOptions) => {
  return { info, req, res };
};

type Context = ReturnType<typeof createContext> & {
  user?: User;
};

export const router = t.router;
export const merge = t.mergeRouters;
export const publicProcedure = t.procedure.use(logger);

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

export const authedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    const { user, sessionId } = getUserFromCookie(ctx.req);
    return next({ ctx: { user, sessionId } });
  })
  .use(logger);

export const maybeAuthedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    try {
      const { user, sessionId } = getUserFromCookie(ctx.req);
      return next({ ctx: { user, sessionId } });
    } catch (err) {
      return next();
    }
  })
  .use(logger);

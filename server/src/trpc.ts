import { initTRPC, TRPCError } from '@trpc/server';
import { db } from './db';
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import type { IncomingMessageWithBody } from '@trpc/server/adapters/node-http';
import type { User } from './types';
import { createLimiter } from './ratelimit';

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
    if (key !== undefined) {
      acc[key] = value ?? '1'; // default to some truthy value
    }
    return acc;
  }, {});
}

function getUserFromCookie(req: IncomingMessageWithBody) {
  const cookie = req.headers.cookie;
  if (!cookie) throw new Error('unauthorized');
  const sessionId = parseCookie(cookie)['Session-Id'];
  if (!sessionId) throw new Error('unauthorized');
  const user = db.users.find((user) => user.sessions.find((session) => session.id === sessionId));
  if (!user) throw new Error('user not found');
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

const limiter = createLimiter({ limit: 2, windowDuration: 60 * 1000 });
export const basicAuthedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    const ip = ctx.req.socket.remoteAddress;
    console.log(`ip ${ip} attempting basic auth`);
    const { limited, retryAfter } = limiter(ip ?? 'unknown');
    if (limited) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `rate limit exceeded! retry in ${Math.floor((retryAfter ?? 0) / 1000)}s`,
      });
    }

    const authHeader = ctx.req.headers.authorization;
    if (!authHeader) {
      ctx.res.setHeader('WWW-Authenticate', 'Basic');
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'unauthorized',
      });
    }

    const [username, password] = Buffer.from(authHeader.slice('Basic '.length), 'base64').toString().split(':');
    if (username !== 'abc' && password !== '123') {
      ctx.res.setHeader('WWW-Authenticate', 'Basic');
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'unauthorized',
      });
    }

    return next();
  })
  .use(logger);

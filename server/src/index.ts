import cors from 'cors';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext, merge } from './trpc';
import { authRouter } from './routers/auth';
import { hackathonRouter } from './routers/hackathon';
import { sideQuestRouter } from './routers/sideQuests';

const appRouter = merge(authRouter, hackathonRouter, sideQuestRouter);

const server = createHTTPServer({
  router: appRouter,
  middleware: cors({
    credentials: true,
    origin: 'http://localhost:5173',
  }),
  createContext,
});

server.listen(3000);

export type AppRouter = typeof appRouter;

import cors from 'cors';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext, merge } from './trpc';
import { authRouter, chatRouter, hackathonRouter, sideQuestRouter } from './routers';

const appRouter = merge(authRouter, chatRouter, hackathonRouter, sideQuestRouter);

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

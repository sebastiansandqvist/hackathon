import EventEmitter, { on } from 'node:events';
import { z } from 'zod';
import { authedProcedure, router } from '../../trpc';
import { db } from '../../db';

const ee = new EventEmitter<{ message: Message[] }>();
type Message = { text: string; sentBy: string; timestamp: number; isAnonymous: boolean };
const messages: Message[] = [];

function mapMessageSender(message: Message) {
  const field = message.isAnonymous ? 'anonymousName' : 'username';
  return {
    ...message,
    sentBy: db.users.find((user) => user.id === message.sentBy)?.[field] ?? '???',
  };
}

export const chatRouter = router({
  sendMessage: authedProcedure
    .input(
      z.object({
        text: z.string().max(128),
        isAnonymous: z.boolean(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const message = {
        text: input.text,
        sentBy: ctx.user.id,
        timestamp: Date.now(),
        isAnonymous: input.isAnonymous,
      };
      messages.push(message);
      ee.emit('message', message);
    }),
  subscribeToChat: authedProcedure.subscription(async function* () {
    yield { kind: 'onSubscribe' as const, messages: messages.map(mapMessageSender).slice(-100) };
    for await (const [message] of on(ee, 'message') as AsyncIterableIterator<[Message]>) {
      yield { kind: 'onMessage' as const, message: mapMessageSender(message) };
    }
  }),
});

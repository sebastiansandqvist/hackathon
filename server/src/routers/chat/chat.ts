import EventEmitter, { on } from 'node:events';
import { z } from 'zod';
import { authedProcedure, router } from '../../trpc';
import { db } from '../../db';

const ee = new EventEmitter<{ message: Message[] }>();
type Message = { text: string; sentBy: string; timestamp: number };
const messages: Message[] = [];

function mapMessageSender(message: Message) {
  return {
    ...message,
    sentBy: db.users.find((user) => user.id === message.sentBy)?.username ?? '???',
  };
}

export const chatRouter = router({
  sendMessage: authedProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const message = {
        text: input.text,
        sentBy: ctx.user.id,
        timestamp: Date.now(),
      };
      console.log('sending', message);
      messages.push(message);
      ee.emit('message', message);
    }),
  subscribeToChat: authedProcedure.subscription(async function* (opts) {
    console.log('subscribed');
    yield { kind: 'onSubscribe' as const, messages: messages.map(mapMessageSender) };
    for await (const [message] of on(ee, 'message') as AsyncIterableIterator<[Message]>) {
      yield { kind: 'onMessage' as const, message: mapMessageSender(message) };
    }
  }),
});

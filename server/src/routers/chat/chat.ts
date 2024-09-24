import EventEmitter, { on } from 'node:events';
import { z } from 'zod';
import { authedProcedure, router } from '../../trpc';
import { db } from '../../db';
import type { Message } from '../../types';

const ee = new EventEmitter<{ message: Message[] }>();

// prevent warnings about memory leaks since we expect more than 10 (the default)
// concurrent listeners on the message event emitter
ee.setMaxListeners(100);

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
      db.chat.push(message);
      if (db.chat.length > 100) db.chat.shift();
      ee.emit('message', message);
    }),
  subscribeToChat: authedProcedure.subscription(async function* () {
    yield { kind: 'onSubscribe' as const, messages: db.chat.map(mapMessageSender) };
    for await (const [message] of on(ee, 'message') as AsyncIterableIterator<[Message]>) {
      yield { kind: 'onMessage' as const, message: mapMessageSender(message) };
    }
  }),
});

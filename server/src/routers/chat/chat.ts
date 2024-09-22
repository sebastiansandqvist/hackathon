import EventEmitter, { on } from 'node:events';
import { z } from 'zod';
import { authedProcedure, router } from '../../trpc';

const ee = new EventEmitter();
const messages: string[] = [];

export const chatRouter = router({
  sendMessage: authedProcedure.input(z.object({ text: z.string() })).mutation(({ input, ctx }) => {
    // TODO: include sender name, timestamp, etc.
    console.log(input.text);
    messages.push(input.text);
    ee.emit('message', input.text);
  }),
  // TODO: can we get rid of this and just use the subscription?
  // on subscribe, we'll initially get all the recent messages and
  // send those in the initial response.
  getMessages: authedProcedure.query(() => {
    return messages; // TODO: implement this. (saved to db?)
  }),
  onChatMessage: authedProcedure.subscription(async function* (opts) {
    console.log('subscribed');
    yield { messages };
    for await (const [message] of on(ee, 'message')) {
      console.log({ message });
      yield message;
    }
  }),
});

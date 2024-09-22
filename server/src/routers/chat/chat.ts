import EventEmitter, { on } from 'node:events';
import { z } from 'zod';
import { authedProcedure, router } from '../../trpc';

const ee = new EventEmitter();
export const chatRouter = router({
  sendMessage: authedProcedure.input(z.object({ text: z.string() })).mutation(({ input, ctx }) => {
    // TODO: include sender name, timestamp, etc.
    ee.emit('message', input.text);
  }),
  getMessages: authedProcedure.query(() => {
    return []; // TODO: implement this. (saved to db?)
  }),
  onChatMessage: authedProcedure.subscription(async function* (opts) {
    for await (const [message] of on(ee, 'add')) {
      console.log({ message });
      yield { message };
    }
  }),
});

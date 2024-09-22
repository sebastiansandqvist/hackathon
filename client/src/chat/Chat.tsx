import { autoAnimate, useAutoAnimate } from 'solid-auto-animate';
import { createSignal, onCleanup, For } from 'solid-js';
import { Input } from '~/components';
import { trpc, mutate, type RouterOutput } from '~/trpc';

type Message = (RouterOutput['subscribeToChat'] & { kind: 'onMessage' })['message'];
const animationDuration = 300;

export function Chat() {
  // TODO: if chat is collapsed, then increase unread count on each message.
  //       while it's open, ensure the unread count is zero.
  // const [unreadMessages, setUnreadMessages] = createSignal(0);
  // const [collapsed, setCollapsed] = createSignal(false);

  let chatContainer: HTMLDivElement;
  useAutoAnimate(() => chatContainer!, { disrespectUserMotionPreference: true, duration: animationDuration });

  const [input, setInput] = createSignal('');
  const [messages, setMessages] = createSignal<Message[]>([]);

  const chat = trpc.subscribeToChat.subscribe(undefined, {
    onData(response) {
      // the initial subscribe returns an array of prior messages
      if (response.kind === 'onSubscribe') {
        setMessages(response.messages);
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        return;
      }
      // subsequent onMessage data events are just individual new messages
      if (response.kind === 'onMessage') {
        setMessages((prev) => [...prev, response.message]);
        if (chatContainer) {
          setTimeout(() => {
            chatContainer.scrollTo({
              behavior: 'smooth',
              top: chatContainer.scrollHeight,
            });
          }, animationDuration);
        }
      }
    },
    onError: console.error,
  });

  const sendMessage = mutate(trpc.sendMessage, {
    onError: console.error,
  });

  onCleanup(() => {
    chat.unsubscribe();
  });

  return (
    <div class="fixed right-0 bottom-0 z-10 grid w-80 gap-2 border border-indigo-300/50 border-b-transparent px-4 pb-4 backdrop-blur-lg">
      <div class="max-h-72 overflow-auto" ref={chatContainer!}>
        <For each={messages()}>
          {(message) => (
            <div class="flex gap-2">
              <span class="text-sm text-indigo-300">{message.sentBy}</span>
              <span class="text-sm">{message.text}</span>
            </div>
          )}
        </For>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage.mutate({ text: input() });
          setInput('');
        }}
      >
        <Input
          type="text"
          class="w-full text-sm"
          placeholder="enter message"
          onInput={(e) => setInput(e.currentTarget.value)}
          value={input()}
        />
      </form>
    </div>
  );
}

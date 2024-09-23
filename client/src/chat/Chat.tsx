import { useAutoAnimate } from 'solid-auto-animate';
import { createSignal, onCleanup, For, Show, onMount } from 'solid-js';
import { Authenticated, Input } from '~/components';
import { trpc, mutate, type RouterOutput } from '~/trpc';

type Message = (RouterOutput['subscribeToChat'] & { kind: 'onMessage' })['message'];
const animationDuration = 300;

export function Chat() {
  const [unreadMessages, setUnreadMessages] = createSignal(0);
  const [collapsed, setCollapsed] = createSignal(false);

  let chatMesssagesContainer: HTMLDivElement;
  useAutoAnimate(() => chatMesssagesContainer!, { duration: animationDuration });

  const [input, setInput] = createSignal('');
  const [isAnonymous, setIsAnonymous] = createSignal(false);
  const [messages, setMessages] = createSignal<Message[]>([]);

  const chat = trpc.subscribeToChat.subscribe(undefined, {
    onData(response) {
      // the initial subscribe returns an array of prior messages
      if (response.kind === 'onSubscribe') {
        setMessages(response.messages);
        if (chatMesssagesContainer) {
          chatMesssagesContainer.scrollTop = chatMesssagesContainer.scrollHeight;
        }
        return;
      }
      // subsequent onMessage data events are just individual new messages
      if (response.kind === 'onMessage') {
        setMessages((prev) => [...prev, response.message]);
        if (collapsed()) {
          setUnreadMessages((prev) => prev + 1);
        }
        if (chatMesssagesContainer) {
          setTimeout(() => {
            chatMesssagesContainer.scrollTo({
              behavior: 'smooth',
              top: chatMesssagesContainer.scrollHeight,
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
    <Authenticated>
      <div
        class="fixed right-0 bottom-0 z-10 grid gap-2 border border-indigo-300/50 border-r-transparent border-b-transparent"
        classList={{
          'w-80': !collapsed(),
          'w-auto text-indigo-200 hover:text-white hover:bg-indigo-900 transition': collapsed(),
        }}
      >
        <Show
          when={!collapsed()}
          fallback={
            <div
              class="cursor-pointer py-2 px-4"
              onClick={() => {
                setCollapsed(false);
                setUnreadMessages(0);
                chatMesssagesContainer.scrollTop = chatMesssagesContainer.scrollHeight;
              }}
            >
              chat
              <Show when={unreadMessages() > 0}>
                : <span class="text-rose-500">({unreadMessages()})</span>
              </Show>
            </div>
          }
        >
          <button
            class="masked-blur absolute top-0 right-0 left-0 z-10 flex cursor-pointer items-center justify-between py-2 px-4 text-indigo-300/75 backdrop-blur transition hover:text-indigo-100"
            onClick={() => {
              setCollapsed(true);
            }}
          >
            <strong class="text-sm text-white">chat</strong>
            <div class="font-dot w-min rotate-90 transform text-2xl">&gt;</div>
          </button>
          <div class="grid gap-2 backdrop-blur-2xl">
            <div class="grid max-h-96 min-h-8 gap-3 overflow-auto px-4" ref={chatMesssagesContainer!}>
              <For each={messages()}>
                {(message) => (
                  <div class="grid first:pt-10">
                    <span class="text-xs text-indigo-300">
                      {message.sentBy}{' '}
                      <small class="opacity-75">
                        (
                        {new Date(message.timestamp)
                          .toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })
                          .replace(/ [AP][M]$/, '')}
                        )
                      </small>
                    </span>
                    <span class="text-sm">{message.text} </span>
                  </div>
                )}
              </For>
            </div>
            <form
              class="flex items-center gap-2 px-4 pb-4"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage.mutate({ text: input(), isAnonymous: isAnonymous() });
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
              <label class="flex items-center gap-1 text-sm text-indigo-300 select-none">
                <input
                  class="accent-indigo-500"
                  type="checkbox"
                  checked={isAnonymous()}
                  onInput={(e) => setIsAnonymous(e.currentTarget.checked)}
                />
                anon
              </label>
            </form>
          </div>
        </Show>
      </div>
    </Authenticated>
  );
}

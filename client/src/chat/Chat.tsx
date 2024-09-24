import { createSignal, onCleanup, For, Show, onMount } from 'solid-js';
import { Authenticated, flashMessage, Input } from '~/components';
import { trpc, mutate, type RouterOutput } from '~/trpc';

type Message = (RouterOutput['subscribeToChat'] & { kind: 'onMessage' })['message'];

function clamp(props: { min: number; max: number; value: number }) {
  return Math.max(Math.min(props.value, props.max), props.min);
}

export function Chat() {
  const [unreadMessages, setUnreadMessages] = createSignal(0);
  const [collapsed, setCollapsed] = createSignal(false);
  const [chatMessagesContainer, setChatMessagesContainer] = createSignal<HTMLDivElement>();

  const [input, setInput] = createSignal('');
  const [isAnonymous, setIsAnonymous] = createSignal(false);
  const [messages, setMessages] = createSignal<Message[]>([]);

  const chat = trpc.subscribeToChat.subscribe(undefined, {
    onData(response) {
      const container = chatMessagesContainer();

      // the initial subscribe returns an array of prior messages
      if (response.kind === 'onSubscribe') {
        setMessages(response.messages);
        if (container) container.scrollTop = container.scrollHeight;
        return;
      }

      // subsequent onMessage data events are just individual new messages
      if (response.kind === 'onMessage') {
        setMessages((prev) => [...prev, response.message]);
        if (collapsed()) {
          flashMessage(response.message.text, 'indigo');
          setUnreadMessages((prev) => prev + 1);
        }
        if (container) {
          container.scrollTo({
            behavior: 'smooth',
            top: container.scrollHeight,
          });
        }
      }
    },
    onError: console.error,
  });

  const sendMessage = mutate(trpc.sendMessage, {
    onError: console.error,
  });

  let initialPointerX = 0;
  let initialPointerY = 0;
  let isResizing = false;

  const [isAnimating, setIsAnimating] = createSignal(false);
  const [height, setHeight] = createSignal(500);
  const [width, setWidth] = createSignal(320);

  const handlePointerUp = () => {
    isResizing = false;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - initialPointerX;
    const deltaY = e.clientY - initialPointerY;
    initialPointerX = e.clientX;
    initialPointerY = e.clientY;
    setWidth((w) => clamp({ min: 208, max: window.innerWidth - 20, value: w - deltaX }));
    setHeight((h) => clamp({ min: 120, max: window.innerHeight - 20, value: h - deltaY }));
  };

  const handleResize = () => {
    setWidth((w) => clamp({ min: 208, max: window.innerWidth - 20, value: w }));
    setHeight((h) => clamp({ min: 120, max: window.innerHeight - 20, value: h }));
  };

  onMount(() => {
    handleResize();
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  onCleanup(() => {
    chat.unsubscribe();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  });

  return (
    <Authenticated>
      <div
        class="fixed right-0 bottom-0 z-10 grid gap-2 border border-r-transparent border-b-transparent"
        classList={{
          'text-indigo-200 hover:text-white backdrop-blur-2xl': collapsed(),
          'transition-all': collapsed() || isAnimating(),
          'border-indigo-300/50': unreadMessages() === 0,
          'hover:bg-indigo-900': collapsed() && unreadMessages() === 0,
          'border-blue-500 hover:border-blue-400': unreadMessages() > 0,
        }}
        style={{
          width: collapsed() ? `96px` : `${width()}px`,
          height: collapsed() ? `40px` : `${height()}px`,
        }}
        onTransitionEnd={() => {
          setIsAnimating(false);
        }}
      >
        <Show when={collapsed()}>
          <button
            class="cursor-pointer py-2 text-sm"
            classList={{
              'bg-blue-700 hover:bg-blue-600': unreadMessages() > 0,
            }}
            onClick={() => {
              setIsAnimating(true);
              setCollapsed(false);
              setUnreadMessages(0);
              const container = chatMessagesContainer();
              if (!container) return;
              container.scrollTop = container.scrollHeight;
            }}
          >
            <strong>chat</strong>
            <Show when={unreadMessages() > 0}>
              : <span class="text-white">({unreadMessages()})</span>
            </Show>
          </button>
        </Show>
        <div
          classList={{
            hidden: collapsed(),
          }}
        >
          <button
            class="masked-blur absolute top-0 right-0 left-0 z-10 flex cursor-pointer items-center justify-between py-2 px-4 text-indigo-300/75 backdrop-blur transition select-none hover:text-indigo-100"
            onClick={() => {
              setCollapsed(true);
            }}
          >
            <strong class="text-sm text-white">chat</strong>
            <div class="font-dot w-min rotate-90 transform text-2xl">&gt;</div>
          </button>
          <div
            class="absolute top-0 left-0 z-20 h-6 w-6 cursor-nw-resize"
            onPointerDown={(e) => {
              e.preventDefault();
              isResizing = true;
              initialPointerX = e.clientX;
              initialPointerY = e.clientY;
            }}
          />
          <div class="flex flex-col gap-2 backdrop-blur-2xl">
            <div
              class="flex min-h-8 flex-col gap-3 overflow-auto overscroll-contain px-4"
              style={{
                height: `${height() - 51}px`,
              }}
              ref={(el) => {
                setChatMessagesContainer(el);
                el.scrollTop = el.scrollHeight;
              }}
            >
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
                maxLength={128}
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
        </div>
      </div>
    </Authenticated>
  );
}

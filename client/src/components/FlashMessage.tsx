import { createEffect, createSignal, Show } from 'solid-js';
import { query, trpc } from '../trpc';

const [message, setMessage] = createSignal<{ color: 'green' | 'red' | 'indigo'; message: string } | null>();
const duration = 2000;

let timeout: ReturnType<typeof setTimeout>;
export function flashMessage(message: string, color: 'green' | 'red' | 'indigo' = 'green') {
  clearTimeout(timeout);
  setMessage({ message, color });
  timeout = setTimeout(() => {
    setMessage(null);
  }, duration);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function FlashMessageContainer() {
  return (
    <Show when={message()} keyed>
      {(data) => (
        <div
          class="font-pixel animate-flash pointer-events-none fixed inset-0 bottom-1/2 z-20 flex items-center justify-center text-center text-5xl"
          classList={{
            'text-emerald-600': data.color === 'green',
            'text-rose-600': data.color === 'red',
            'text-indigo-500': data.color === 'indigo',
          }}
        >
          {data.message}
        </div>
      )}
    </Show>
  );
}

export function HomepageMessageFlasher() {
  const [lastMessage, setLastMessage] = createSignal('');
  const home = query('homepage', trpc.homepage, {
    refetchInterval: 5000,
  });

  createEffect(() => {
    const newMessage = home.data?.publicMessage.text;
    if (!newMessage) return;
    if (lastMessage() !== newMessage) {
      if (lastMessage()) {
        flashMessage(newMessage, 'indigo');
      }
      setLastMessage(newMessage);
    }
  });

  return null;
}

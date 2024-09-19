import { createSignal, Show } from 'solid-js';

const [message, setMessage] = createSignal<{ color: 'green' | 'red'; message: string } | null>();
const duration = 2000;

let timeout: ReturnType<typeof setTimeout>;
export function flashMessage(message: string, color: 'green' | 'red' = 'green') {
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
          class="font-pixel animate-flash pointer-events-none fixed inset-0 bottom-1/2 z-20 flex items-center justify-center text-6xl"
          classList={{
            'text-emerald-600': data.color === 'green',
            'text-rose-600': data.color === 'red',
          }}
        >
          {data.message}
        </div>
      )}
    </Show>
  );
}

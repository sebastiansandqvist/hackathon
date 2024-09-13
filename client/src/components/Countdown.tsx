import { createSignal, type Component, onCleanup } from 'solid-js';

const formatTimeRemaining = (time: Date) => {
  const timeLeft = time.getTime() - Date.now();
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const Countdown: Component<{ time: Date }> = (props) => {
  const [countdownValue, setCountdownValue] = createSignal(formatTimeRemaining(props.time));

  let raf: number;

  const update = () => {
    setCountdownValue(formatTimeRemaining(props.time));
    raf = requestAnimationFrame(update);
  };

  raf = requestAnimationFrame(update);

  onCleanup(() => cancelAnimationFrame(raf));

  return (
    <div class="font-dot relative mx-auto text-6xl sm:text-8xl md:text-9xl">
      <time class="bg-gradient-to-b from-white to-violet-500 bg-clip-text text-transparent">{countdownValue()}</time>
      <p class="pointer-events-none absolute top-0 text-blue-400 blur-lg">{countdownValue()}</p>
    </div>
  );
};

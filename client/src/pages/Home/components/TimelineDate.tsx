import { createSignal, onCleanup, Show, type Component } from 'solid-js';
import ago from 's-ago';

function formatTime(time: string) {
  const date = new Date(time);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

// ugh.
// function relativeTime(time: string) {
//   const date = new Date(time);
//   const dt = date.getTime() - Date.now();
//   const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' });
//   // TODO: base unit on diff
//   if (dt < 60 * 1000) return relative.format(dt / 1000, 'second');
//   if (dt < 60 * 60 * 1000) return relative.format(dt / (60 * 1000), 'minute');
//   return relative.format(dt / (60 * 60 * 1000), 'hour');
// }

export const TimelineDate: Component<{ time: string; label: string; isNext: boolean; isCurrent: boolean }> = (
  props,
) => {
  const [now, setNow] = createSignal(Date.now());
  const isPast = () => now() > new Date(props.time).getTime();

  const interval = setInterval(() => {
    setNow(Date.now());
  }, 60 * 1000);

  onCleanup(() => clearInterval(interval));

  return (
    <div class="group grid grid-cols-[22ch_30ch] items-baseline">
      <p
        class="font-bold"
        classList={{
          'text-emerald-500 before:font-dot before:content-[">"] before:pr-1': props.isCurrent,
          'text-indigo-300/75 line-through': !props.isCurrent && isPast(),
          'text-indigo-200': !props.isCurrent && !isPast(),
        }}
      >
        {props.label}{' '}
        <span class="font-normal text-indigo-300/50">
          {'·'.repeat(20 - props.label.length - (props.isCurrent ? 1 : 0))}
        </span>
      </p>
      <p class="text-sm">
        <time datetime={props.time} class="text-indigo-100">
          {formatTime(props.time)}
        </time>
        <time
          class="text-indigo-300/75 opacity-0 transition-opacity group-hover:opacity-100"
          classList={{
            'opacity-100': props.isNext || props.isCurrent,
          }}
          datetime={props.time}
        >
          {' '}
          ({ago(new Date(props.time), 'hour')})
        </time>
      </p>
    </div>
  );
};

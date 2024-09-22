import { type Component, type JSX, createSignal, createEffect, onCleanup, For, Index } from 'solid-js';

export const Slideshow: Component<{
  children: JSX.Element[];
  onSlideChange: (index: number) => void;
}> = (props) => {
  const [index, setIndex] = createSignal(0);
  const elements = props.children.map(() => createSignal<HTMLElement>());

  createEffect(() => {
    const i = index();
    props.onSlideChange(i);
    const [element] = elements[i]!;
    const el = element();
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const handleArrowKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, props.children.length - 1));
    }
  };

  window.addEventListener('keydown', handleArrowKey);

  onCleanup(() => {
    window.removeEventListener('keydown', handleArrowKey);
  });

  return (
    <>
      <div
        class="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScrollEnd={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / window.innerWidth));
          // TODO: make sure this doesn't interfere with the scrollIntoView
        }}
      >
        <For each={props.children}>
          {(slide, i) => (
            <div
              class="w-screen shrink-0 snap-center"
              ref={(el) => {
                const [, setElement] = elements[i()]!;
                setElement(el);
              }}
            >
              {slide}
            </div>
          )}
        </For>
      </div>
      <nav class="fixed right-0 bottom-6 left-0 flex items-center justify-center gap-6">
        <button
          class="font-dot p-2 text-5xl text-indigo-100 transition enabled:cursor-pointer enabled:hover:text-white disabled:text-indigo-300/50"
          disabled={index() === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          &lt;
        </button>
        <div class="flex items-center justify-center gap-1 pb-2">
          <Index each={props.children}>
            {(item, i) => (
              <button
                class="font-dot box-content h-1.5 w-1.5 grow-0 border border-solid border-slate-950 bg-indigo-300/50 transition enabled:cursor-pointer enabled:hover:bg-white disabled:border-indigo-100 disabled:bg-indigo-100"
                disabled={index() === i}
                onClick={() => setIndex(i)}
              />
            )}
          </Index>
        </div>
        <button
          class="font-dot p-2 text-5xl text-indigo-100 transition enabled:cursor-pointer enabled:hover:text-white disabled:text-indigo-300/50"
          disabled={index() === props.children.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          &gt
        </button>
      </nav>
    </>
  );
};

import { createEffect, createSignal, For, Index, Match, Show, Switch, type Component, type JSX } from 'solid-js';
import { Layout } from '../../components/Layout';
import { Title } from '../../components/Text';
import { query, trpc } from '../../trpc';
import { autoAnimate, useAutoAnimate } from 'solid-auto-animate';
import { Transition } from 'solid-transition-group';

// should be interactive and presentation-like,
// similar to the homepage reveal section-by-section
// or like a powerpoint presentation
const Slideshow: Component<{
  // children: ((args: { next: () => void; prev: () => void }) => JSX.Element)[];
  children: JSX.Element[];
  onSlideChange: (index: number) => void;
}> = (props) => {
  const [index, setIndex] = createSignal(0);
  createEffect(() => {
    props.onSlideChange(index());
  });
  return (
    <>
      <div class="bg-green-900">test</div>
      <nav class="fixed right-0 bottom-4 left-0 flex items-center justify-center gap-4">
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
                // classList={{
                //   '': index() === i,
                // }}
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

const TitleWithTransition: Component<{ title: () => string }> = (props) => {
  return (
    <div class="stack !place-content-start">
      <Transition
        onEnter={(el, done) => {
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
          }).finished.then(done);
        }}
        onExit={(el, done) => {
          el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 300,
          }).finished.then(done);
        }}
      >
        <Switch>
          <Match when={props.title() === 'Results'}>
            <Title>Results</Title>
          </Match>
          <Match when={props.title() === 'Username'}>
            <Title>Username</Title>
          </Match>
          <Match when={props.title() === 'Side Quests'}>
            <Title>Side Quests</Title>
          </Match>
        </Switch>
      </Transition>
    </div>
  );
};

export function Results() {
  const results = query('results', trpc.results);
  // TODO: transition the change in title
  const [title, setTitle] = createSignal('Results');
  return (
    <Layout>
      <TitleWithTransition title={title} />
      <Slideshow
        onSlideChange={(i) => {
          const titles = ['Results', 'Username', 'Side Quests'];
          setTitle(titles[i]!);
        }}
      >
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </Slideshow>
      {/* <Slideshow>{[() => <div>slide 1</div>, () => <div>slide 2</div>, () => <div>slide 3</div>]}</Slideshow> */}
    </Layout>
  );
}

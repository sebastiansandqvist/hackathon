import {
  createEffect,
  createSignal,
  For,
  Index,
  Match,
  Show,
  Switch,
  type Component,
  type JSX,
  type Signal,
} from 'solid-js';
import { Dots, InnerLayout, Layout } from '../../components/Layout';
import { SectionHeading, Title, Uppercase } from '../../components/Text';
import { query, trpc } from '../../trpc';
import { autoAnimate, useAutoAnimate } from 'solid-auto-animate';
import { Transition } from 'solid-transition-group';
import { BlurrySection } from '../../components/BlurrySection';
import { LeaderboardCanvas, LeaderboardCanvasMetadata } from '../Home/components/Leaderboard';

// should be interactive and presentation-like,
// similar to the homepage reveal section-by-section
// or like a powerpoint presentation
const Slideshow: Component<{
  // children: ((args: { next: () => void; prev: () => void }) => JSX.Element)[];
  children: JSX.Element[];
  onSlideChange: (index: number) => void;
}> = (props) => {
  const [index, setIndex] = createSignal(0);
  const [elements, setElements] = createSignal<Signal<HTMLDivElement | undefined>[]>(
    props.children.map(() => createSignal()),
  );
  createEffect(() => {
    const i = index();
    props.onSlideChange(i);
    const [element] = elements()[i]!;
    const el = element();
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return (
    <>
      <div class="flex snap-x snap-mandatory overflow-x-auto">
        <For each={props.children}>
          {(slide, i) => (
            <div class="w-screen shrink-0 snap-center" ref={(el) => elements()[i()]?.[1](el)}>
              {slide}
            </div>
          )}
        </For>
      </div>
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
  const [title, setTitle] = createSignal('Results');
  return (
    <Dots>
      <div class="mx-auto max-w-4xl p-12">
        <TitleWithTransition title={title} />
      </div>
      <Show when={results.data} keyed>
        {(data) => (
          <Slideshow
            onSlideChange={(i) => {
              const titles = ['Results', 'Side Quests'];
              setTitle(titles[i]!);
            }}
          >
            <InnerLayout>
              <BlurrySection section="results-username-header">
                <header class="grid gap-4">
                  <Uppercase class="!text-indigo-200">
                    with {data.mostPerfectUsernames[0]?.renameCounter} rerolls...
                  </Uppercase>
                  <p class="text-2xl">the most perfect username goes to...</p>
                  <BlurrySection section="results-username-winner">
                    <section class="flex flex-wrap items-center gap-4">
                      <p class="text-2xl font-bold">{data.mostPerfectUsernames[0]?.username ?? '???'}!</p>
                      <Uppercase class="!text-indigo-200">
                        the <q>{data.mostPerfectUsernames[0]?.anonymousName}</q>
                      </Uppercase>
                    </section>
                  </BlurrySection>
                </header>
              </BlurrySection>
              <BlurrySection section="results-username-table">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b-2 border-indigo-300/50">
                      <th class="pb-2">user</th>
                      <th class="pb-2">anonymous name</th>
                      <th class="pb-2 text-right">rerolls</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={data.mostPerfectUsernames}>
                      {(user) => (
                        <tr class="group">
                          <td class="pb-2 font-bold group-first:pt-2">{user.username}</td>
                          <td class="pb-2 text-indigo-200 group-first:pt-2">{user.anonymousName}</td>
                          <td class="pb-2 text-right group-first:pt-2">{user.renameCounter}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </BlurrySection>
            </InnerLayout>
            <InnerLayout>
              <BlurrySection section="results-leaderboard">
                <SectionHeading>lead3rboard</SectionHeading>
                <div class="grid gap-4">
                  <For each={data.sideQuestProgress}>
                    {(progress) => (
                      <div class="grid grid-rows-[auto_20px] gap-1">
                        <p class="font-bold text-indigo-200">{progress.username}</p>
                        <LeaderboardCanvas progress={progress.progress} times={data.times} />
                      </div>
                    )}
                  </For>
                  <div class="-mt-4 h-8">
                    <LeaderboardCanvasMetadata times={data.times} />
                  </div>
                </div>
              </BlurrySection>
            </InnerLayout>
            <InnerLayout>
              <SectionHeading>...</SectionHeading>
            </InnerLayout>
          </Slideshow>
        )}
      </Show>
    </Dots>
  );
}

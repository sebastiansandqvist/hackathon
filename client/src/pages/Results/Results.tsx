import {
  createEffect,
  createSignal,
  For,
  Index,
  Match,
  onCleanup,
  Show,
  Switch,
  type Component,
  type JSX,
  type Signal,
} from 'solid-js';
import { Dots, InnerLayout, Layout } from '../../components/Layout';
import { SectionHeading, Title, Uppercase } from '../../components/Text';
import { query, trpc, type RouterOutput } from '../../trpc';
import { autoAnimate, useAutoAnimate } from 'solid-auto-animate';
import { Transition } from 'solid-transition-group';
import { BlurrySection } from '../../components/BlurrySection';
import { LeaderboardCanvas, LeaderboardCanvasMetadata } from '../Home/components/Leaderboard';
import { commaSeparatedList } from '../../util';

const ProjectResult: Component<{
  place: 'first' | 'second' | 'third';
  project: RouterOutput['results']['projects'][number];
}> = (props) => (
  <InnerLayout>
    <section class="grid gap-4">
      <BlurrySection section={`results-project-${props.place}`}>
        <Uppercase class="!text-indigo-200">
          in {props.place} place with {props.project.votes.total} points...
        </Uppercase>
      </BlurrySection>
      <BlurrySection section={`results-project-${props.project.id}`}>
        <SectionHeading>{props.project.name}</SectionHeading>
        <p class="text-indigo-200">
          congrats, <strong>{commaSeparatedList([props.project.createdBy, ...props.project.contributors])}</strong>!
        </p>
      </BlurrySection>
    </section>
  </InnerLayout>
);

const LeaderboardResult: Component<{
  sideQuestProgress: RouterOutput['results']['sideQuestProgress'];
  times: RouterOutput['results']['times'];
}> = (props) => (
  <InnerLayout>
    <SectionHeading>leaderboard</SectionHeading>
    <div class="grid gap-4">
      <For each={props.sideQuestProgress}>
        {(progress) => (
          <div class="grid grid-rows-[auto_20px] gap-1">
            <p class="font-bold text-indigo-200">
              {progress.username}{' '}
              <span class="text-sm text-emerald-500">(+{progress.totalPointsBeforeDeductions})</span>
              <Show when={progress.deductions}>
                <>
                  <span class="text-sm text-rose-500"> (-{progress.deductions})</span>
                  <span class="text-sm text-indigo-300/75">
                    {' '}
                    = {progress.totalPointsBeforeDeductions - progress.deductions}
                  </span>
                </>
              </Show>
            </p>
            <LeaderboardCanvas progress={progress.progress} times={props.times} />
          </div>
        )}
      </For>
      <div class="-mt-4 h-8">
        <LeaderboardCanvasMetadata times={props.times} />
      </div>
    </div>
  </InnerLayout>
);

const Slideshow: Component<{
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
        class="flex snap-x snap-mandatory overflow-x-auto"
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
          <Match when={props.title() === 'Projects'}>
            <Title>Projects</Title>
          </Match>
          <Match when={props.title() === 'And the winner is'}>
            <Title>And the winner is...</Title>
          </Match>
        </Switch>
      </Transition>
    </div>
  );
};

const UsernameResult: Component<{ usernames: RouterOutput['results']['mostPerfectUsernames'] }> = (props) => (
  <InnerLayout>
    <BlurrySection section="results-username-header">
      <header class="grid gap-4">
        <Uppercase class="!text-indigo-200">with {props.usernames[0]?.renameCounter} rerolls...</Uppercase>
        <p class="text-2xl">the most perfect username goes to...</p>
        <BlurrySection section="results-username-winner">
          <section class="flex flex-wrap items-center gap-4">
            <p class="text-2xl font-bold">{props.usernames[0]?.username ?? '???'}!</p>
            <Uppercase class="!text-indigo-200">
              the <q>{props.usernames[0]?.anonymousName}</q>
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
          <For each={props.usernames}>
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
);

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
              const titles = ['Results', 'Side Quests', 'Projects', 'Projects', 'And the winner is'];
              setTitle(titles[i]!);
            }}
          >
            <UsernameResult usernames={data.mostPerfectUsernames} />
            <LeaderboardResult sideQuestProgress={data.sideQuestProgress} times={data.times} />
            <ProjectResult place="third" project={data.projects[2]!} />
            <ProjectResult place="second" project={data.projects[1]!} />
            <ProjectResult place="first" project={data.projects[0]!} />
          </Slideshow>
        )}
      </Show>
    </Dots>
  );
}

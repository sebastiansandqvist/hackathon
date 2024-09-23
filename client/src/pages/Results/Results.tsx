import { createSignal, For, Match, Show, Switch, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import { useAutoAnimate } from 'solid-auto-animate';
import { Transition } from 'solid-transition-group';
import {
  ButtonPrimary,
  BlurrySection,
  Dots,
  InnerLayout,
  SectionHeading,
  Title,
  Uppercase,
  Glitch,
} from '~/components';
import { query, trpc, type RouterOutput } from '~/trpc';
import { commaSeparatedList } from '~/util';
import { LeaderboardCanvas, LeaderboardCanvasMetadata } from '../Home/components';
import { Slideshow } from './components/Slideshow';

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

const ProjectResult: Component<{
  place: 'first' | 'second' | 'third';
  project: RouterOutput['results']['projects'][number];
}> = (props) => (
  <InnerLayout>
    <section class="grid gap-6">
      <BlurrySection section={`results-project-${props.place}`}>
        <Uppercase class="!text-indigo-200">
          <Glitch loopFrequency={16000}>{`in ${props.place} place with ${props.project.votes.total} points...`}</Glitch>
        </Uppercase>
      </BlurrySection>
      <BlurrySection section={`results-project-${props.project.id}`}>
        <div class="grid gap-6">
          <SectionHeading>
            <Glitch loopFrequency={10000}>{props.project.name}</Glitch>
          </SectionHeading>
          <p class="text-indigo-200">
            congrats, <strong>{commaSeparatedList([props.project.createdBy, ...props.project.contributors])}</strong>!
          </p>
          <Show when={props.place === 'first'}>
            <A href={`/projects/${props.project.id}`}>
              <ButtonPrimary>
                view project <span class="font-dot not-italic">&gt;</span>
              </ButtonPrimary>
            </A>
          </Show>
        </div>
      </BlurrySection>
    </section>
  </InnerLayout>
);

const LeaderboardResult: Component<{
  sideQuestProgress: RouterOutput['results']['sideQuestProgress'];
  times: RouterOutput['results']['times'];
}> = (props) => {
  let parent: HTMLDivElement;
  const defaultSlice = 3;
  const [slice, setSlice] = createSignal(defaultSlice);
  useAutoAnimate(() => parent!, {});
  return (
    <InnerLayout>
      <SectionHeading>
        <Glitch loopFrequency={10000}>leaderboard</Glitch>
      </SectionHeading>
      <div class="grid gap-6" ref={parent!}>
        <For each={props.sideQuestProgress.slice(0, slice())}>
          {(progress) => (
            <div class="grid grid-rows-[auto_20px] gap-1">
              <p class="text-xl font-bold text-indigo-200">
                {progress.username}{' '}
                <span class="text-sm text-emerald-500">+{progress.totalPointsBeforeDeductions}</span>
                <Show when={progress.deductions}>
                  <>
                    <span class="text-sm text-rose-500"> - {progress.deductions}</span>
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
      <Show when={slice() === defaultSlice}>
        <div>
          <ButtonPrimary onClick={() => setSlice(100)}>show all</ButtonPrimary>
        </div>
      </Show>
    </InnerLayout>
  );
};

const UsernameResult: Component<{ usernames: RouterOutput['results']['mostPerfectUsernames'] }> = (props) => (
  <InnerLayout>
    <BlurrySection section="results-username-header">
      <header class="grid gap-6">
        <Uppercase class="!text-indigo-200">with {props.usernames[0]?.renameCounter} rerolls...</Uppercase>
        <p class="text-xl">
          in the hunt for the perfect name, <br />
          the award for most effort goes to...
        </p>
        <BlurrySection section="results-username-winner">
          <section class="flex flex-wrap items-center gap-4">
            <p class="text-2xl font-bold">{props.usernames[0]?.username ?? '???'}!</p>
            <Uppercase class="!text-indigo-200">
              the{' '}
              <q>
                <Glitch loopFrequency={10000}>{props.usernames[0]?.anonymousName ?? ''}</Glitch>
              </q>
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

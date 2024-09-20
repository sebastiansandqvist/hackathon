import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { query, trpc } from '../../trpc';
import { Countdown } from './components/Countdown';
import { BlurrySection } from '../../components/BlurrySection';
import {
  Authenticated,
  AuthForm,
  NotTv,
  RerollAnonymousNameButton,
  SignOutButton,
  TvOnly,
  Unauthenticated,
} from '../../components/Auth';
import { CanvasGridBg } from '../../components/CanvasGridBg';
import { EditMessageImageButton, EditMessageButton } from './components/EditMessageButton';
import { Layout } from '../../components/Layout';
import { SideQuestPointCount } from './components/SideQuestPointCount';
import { TimelineDate } from './components/TimelineDate';
import { FoodGame } from './components/FoodGame';
import { LeaderboardCanvas, LeaderboardCanvasMetadata } from './components/Leaderboard';
import { SectionHeading, Uppercase } from '../../components/Text';

export function Home() {
  const home = query('homepage', trpc.homepage, {
    refetchInterval: 5000,
  });

  return (
    <Layout>
      <Show when={home.data} keyed>
        {(data) => <Countdown time={new Date(data.times.codingStart)} />}
      </Show>
      <CanvasGridBg>
        <header class="flex items-center justify-between gap-4 p-8">
          <Show when={home.data} keyed>
            {(data) => (
              <div class="grid gap-2">
                <h1 class="font-pixel text-2xl">{data.publicMessage.text}</h1>
                <Show when={data.publicMessage.imgUrl}>
                  <img src={data.publicMessage.imgUrl} class="max-h-64 max-w-full" />
                </Show>
                <Show when={data.publicMessage.author && data.publicMessage.author !== 'tv'}>
                  <footer>
                    <cite>
                      <span class="text-indigo-300">– posted by </span>
                      <strong class="font-bold">{data.publicMessage.author}</strong>
                    </cite>
                  </footer>
                </Show>
              </div>
            )}
          </Show>
          <Authenticated>
            {({ username, sideQuests }) => (
              <Show when={username !== 'tv'}>
                <div class="grid gap-2">
                  <EditMessageButton />
                  <Show when={sideQuests.hacking.easy}>
                    <EditMessageImageButton />
                  </Show>
                </div>
              </Show>
            )}
          </Authenticated>
        </header>
      </CanvasGridBg>

      <Authenticated>
        {({ anonymousName, username }) => (
          <Show when={username !== 'tv'}>
            <section class="flex flex-col gap-4">
              <p>
                <span class="text-indigo-300">welcome, </span>
                <strong>{username}</strong>
                <span class="font-bold text-indigo-300">!</span>
              </p>
              <div class="flex flex-wrap gap-2">
                <div>
                  <span class="text-indigo-300">your anonymous username is</span> <strong>{anonymousName}</strong>.{' '}
                  <br />
                  <RerollAnonymousNameButton />
                  <span class="text-indigo-300"> until you are happy with it.</span>
                </div>
              </div>
            </section>
          </Show>
        )}
      </Authenticated>
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <BlurrySection section="timeline">
        <SectionHeading>timel1ne</SectionHeading>
        <Show when={home.data} fallback="..." keyed>
          {(data) => (
            <div class="grid gap-2">
              <TimelineDate
                time={data.times.codingStart}
                label="coding"
                isNext={data.checkpoints.next === 'codingStart'}
                isCurrent={data.checkpoints.current === 'codingStart'}
              />
              <TimelineDate
                time={data.times.codingEnd}
                label="code complete"
                isNext={data.checkpoints.next === 'codingEnd'}
                isCurrent={data.checkpoints.current === 'codingEnd'}
              />
              <TimelineDate
                time={data.times.demoStart}
                label="demos!"
                isNext={data.checkpoints.next === 'demoStart'}
                isCurrent={data.checkpoints.current === 'demoStart'}
              />
              <TimelineDate
                time={data.times.votingStart}
                label="voting"
                isNext={data.checkpoints.next === 'votingStart'}
                isCurrent={data.checkpoints.current === 'votingStart'}
              />
            </div>
          )}
        </Show>
      </BlurrySection>
      <BlurrySection section="leaderboard">
        <SectionHeading>lead3rboard</SectionHeading>
        <Show when={home.data} fallback="..." keyed>
          {(data) => (
            <div class="grid gap-4">
              <For each={data.sideQuestProgress}>
                {(progress) => (
                  <div class="grid grid-rows-[auto_20px] gap-1">
                    <p class="font-bold text-indigo-200">{progress.anonymousName}</p>
                    <LeaderboardCanvas progress={progress.progress} times={data.times} />
                  </div>
                )}
              </For>
              <div class="-mt-4 h-8">
                <LeaderboardCanvasMetadata times={data.times} />
              </div>
            </div>
          )}
        </Show>
      </BlurrySection>
      <NotTv>
        <BlurrySection section="side quests">
          <SectionHeading>side que5ts</SectionHeading>
          <ul>
            <li>
              <A href="/algorithms" class="text-indigo-300 transition hover:text-indigo-200">
                algorithms <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="algorithms" />
            </li>
            <li>
              <A href="/forensics" class="text-indigo-300 transition hover:text-indigo-200">
                forensics <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="forensics" />
            </li>
            <li>
              <A href="/graphics" class="text-indigo-300 transition hover:text-indigo-200">
                graphics <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="graphics" />
            </li>
            <li>
              <A href="/hacking" class="text-indigo-300 transition hover:text-indigo-200">
                hacking <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="hacking" />
            </li>
            <li>
              <A href="/logic" class="text-indigo-300 transition hover:text-indigo-200">
                logic <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="logic" />
            </li>
            <li>
              <A href="/puzzles" class="text-indigo-300 transition hover:text-indigo-200">
                puzzles <span class="font-dot">&gt;</span>
              </A>
              <SideQuestPointCount quest="puzzles" />
            </li>
            <Authenticated>
              {({ hintDeductions }) => (
                <Show when={hintDeductions > 0}>
                  <li class="mt-2 max-w-xs border-t border-indigo-500/30 pt-2">
                    <span class="text-indigo-300">hints: </span>
                    <span class="text-sm text-rose-500">(-{hintDeductions} points)</span>
                  </li>
                </Show>
              )}
            </Authenticated>
          </ul>
        </BlurrySection>
      </NotTv>

      <TvOnly>
        <BlurrySection section="food game">
          <SectionHeading>f0od game!</SectionHeading>
          <FoodGame title={home.data?.foodGame.title ?? ''} items={home.data?.foodGame.items ?? []} tv />
        </BlurrySection>
      </TvOnly>

      <NotTv>
        <Show when={home.data && home.data!.foodGame.items.length > 0}>
          <BlurrySection section="food game">
            <SectionHeading>f0od game!</SectionHeading>
            <FoodGame title={home.data?.foodGame.title ?? ''} items={home.data?.foodGame.items ?? []} />
          </BlurrySection>
        </Show>
      </NotTv>

      <NotTv>
        <div class="grid gap-2">
          <BlurrySection section="logistics">
            <SectionHeading>hackathon 1nfo</SectionHeading>
            <Uppercase as="h3" class="mt-2">
              logistics
            </Uppercase>
            <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>no obligation to stay in the house, but all are welcome to!</li>
              <li>
                if you're sleeping over, bring whatever you'll need to be comfortable. pillows, blankets, etc. we'll
                provide cots and mattresses.
              </li>
              <li>we'll probably take a climbing break, so if you're into that, bring your gear!</li>
              <li>food: tbd</li>
              <li>wifi password: ...</li>
              <li>address: ...</li>
            </ol>
          </BlurrySection>
          <BlurrySection section="side quest rules">
            <Uppercase as="h3" class="mt-2">
              side quests
            </Uppercase>
            <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>each easy side quest is worth 1 point.</li>
              <li>each hard side quest is worth 2 points.</li>
              <li>these points have a separate prize pool. they do not impact your hackathon project score.</li>
            </ol>
          </BlurrySection>
          <BlurrySection section="projects">
            <Uppercase as="h3" class="mt-2">
              projects
            </Uppercase>
            <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>you can work solo or in teams, or just contribute to random projects.</li>
              <li>theme to be announced on the day of the hackathon.</li>
              <li>
                all code and assets must be created during the hackathon. libraries, scaffolding commands, ai codegen,
                and game engines are all ok to use.
              </li>
            </ol>
          </BlurrySection>
          <BlurrySection section="voting">
            <Uppercase as="h3" class="mt-2">
              voting
            </Uppercase>
            <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>after demos, voting opens on this site.</li>
              <li>everyone anonymously ranks the other projects according to their...</li>
              <ul class="grid list-outside list-disc gap-4 px-6 text-indigo-100 marker:text-indigo-300/75">
                <li>
                  <em>creativity</em>
                </li>
                <li>
                  <em>technical merit</em>
                </li>
                <li>
                  <em>user experience</em>
                </li>
              </ul>
              <li>
                for each ranking we award{' '}
                <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                  [# projects] – [ranking]
                </code>{' '}
                points to that project.
              </li>
              <li>contributors can't vote for their own projects.</li>
              <li>the project with the most points wins!</li>
            </ol>
          </BlurrySection>
          <BlurrySection section="prizes">
            <Uppercase as="h3" class="mt-2">
              prizes
            </Uppercase>
            <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
              <li>tbd</li>
            </ul>
          </BlurrySection>
        </div>
      </NotTv>

      <footer class="border-t border-indigo-500/30 pt-8">
        <Authenticated>{() => <SignOutButton />}</Authenticated>
      </footer>
    </Layout>
  );
}

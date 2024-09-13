import { Match, Show, Switch } from 'solid-js';
import { query, trpc } from '../trpc';
import { Countdown } from '../components/Countdown';
import { BlurrySection } from '../components/BlurrySection';
import { Authenticated, AuthForm, RerollAnonymousNameButton, SignOutButton, Unauthenticated } from '../components/Auth';
import { CanvasGridBg } from '../components/CanvasGridBg';
import { EditMessageButton } from '../components/EditMessageButton';
import { Layout } from '../components/Layout';
import { A } from '@solidjs/router';
import { SideQuestPointCount } from '../components/SideQuestPointCount';

export function Home() {
  const home = query('homepage', trpc.homepage); // TODO: make this a subscription

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
                <h1 class="font-pixel text-2xl leading-loose">{data.publicMessage.text}</h1>
                <Show when={data.publicMessage.imgUrl}>
                  <img src={data.publicMessage.imgUrl} class="max-h-64 max-w-full" />
                </Show>
                <Show when={data.publicMessage.author && data.publicMessage.author !== 'tv'}>
                  <footer>
                    <cite>
                      <span class="opacity-50">– posted by </span>
                      <strong class="font-bold">{data.publicMessage.author}</strong>
                    </cite>
                  </footer>
                </Show>
              </div>
            )}
          </Show>
          <EditMessageButton />
        </header>
      </CanvasGridBg>

      <section>
        <Authenticated>
          {/* TODO: do not show this if the user is tv */}
          {({ anonymousName, username }) => (
            <footer class="flex flex-col gap-4">
              <p>
                <span class="text-indigo-300/75">welcome, </span>
                <strong>{username}</strong>
                <span class="font-bold text-indigo-300/75">!</span>
              </p>
              <div class="flex flex-wrap gap-2">
                <div>
                  <span class="text-indigo-300/75">your anonymous username is</span> <strong>{anonymousName}</strong>.{' '}
                  <br />
                  <RerollAnonymousNameButton />
                  <span class="text-indigo-300/75"> until you are happy with it.</span>
                </div>
              </div>
            </footer>
          )}
        </Authenticated>
        <Unauthenticated>
          <AuthForm />
        </Unauthenticated>
      </section>
      <BlurrySection section="timeline">
        <h2 class="font-pixel text-2xl leading-loose">timel1ne</h2>
        <div class="text-indigo-300/75">
          <p>hackathon start</p>
          <p>[current time]</p>
          <p>hackathon end</p>
          <p>demo start</p>
          <p>voting start</p>
          <p>awards</p>
        </div>
      </BlurrySection>
      <BlurrySection section="side quests">
        <h2 class="font-pixel text-2xl leading-loose">side que5ts</h2>
        <ul>
          <li>
            <A href="/hacking" class="text-indigo-300/75 transition hover:text-indigo-300">
              hacking
            </A>
            <SideQuestPointCount quest="hacking" />
          </li>
          <li>
            <A href="/logic" class="text-indigo-300/75 transition hover:text-indigo-300">
              logic
            </A>
            <SideQuestPointCount quest="logic" />
          </li>
          <li>
            <A href="/algorithms" class="text-indigo-300/75 transition hover:text-indigo-300">
              algorithms
            </A>
            <SideQuestPointCount quest="algorithms" />
          </li>
          <li>
            <A href="/puzzles" class="text-indigo-300/75 transition hover:text-indigo-300">
              puzzles
            </A>
            <SideQuestPointCount quest="puzzles" />
          </li>
        </ul>
      </BlurrySection>
      <BlurrySection section="food game">
        <h2 class="font-pixel text-2xl leading-loose">f0od game!</h2>
        <p>current vote:</p>
      </BlurrySection>
      <BlurrySection section="leaderboard">
        <h2 class="font-pixel text-2xl leading-loose">lead3rboard</h2>
      </BlurrySection>
      <BlurrySection section="rules">
        <div class="grid gap-2">
          <h2 class="font-pixel text-2xl leading-loose">info</h2>
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">hackathon rules</h3>
          <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-200 marker:text-indigo-300/75">
            <li>you can work solo or in teams, or just contribute to random projects.</li>
            <li>
              all code and assets must be created during the hackathon. but libraries, frameworks, and engines are ok.
            </li>
            <li>no obligation to stay in the house, but this website only runs on austin's wifi!</li>
          </ol>
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">points &amp; prizes</h3>
          <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-200 marker:text-indigo-300/75">
            <li>the person with the most points wins the hackathon.</li>
            <li>each easy side quest is worth 1 point.</li>
            <li>each hard side quest is worth 2 points.</li>
            {/* do we want to just make hints a manual process instead? would be more flexible. */}
            {/*<li>asking for a hint will cost you half a point.</li>*/}
            <li>but each hint used costs 1/3 of a point.</li>
            <li>
              prizes:
              <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-200 marker:text-indigo-300/75">
                <li>tbd</li>
              </ul>
            </li>
            <li>
              project voting:
              <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-200 marker:text-indigo-300/75">
                <li>after demos, voting opens on this site.</li>
                <li>everyone anonymously ranks the other projects.</li>
                <li>
                  for each ranking we award{' '}
                  <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-2 text-sm">
                    [# projects] – [ranking]
                  </code>{' '}
                  points to that project.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </BlurrySection>
      <footer class="border-t border-indigo-500/30 pt-8">
        <Authenticated>{() => <SignOutButton />}</Authenticated>
      </footer>
    </Layout>
  );
}

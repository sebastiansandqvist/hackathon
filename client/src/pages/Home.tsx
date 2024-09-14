import { For, Match, Show, Switch, type Component } from 'solid-js';
import { query, trpc, type RouterOutput } from '../trpc';
import { Countdown } from '../components/Countdown';
import { BlurrySection } from '../components/BlurrySection';
import {
  Authenticated,
  AuthForm,
  NotTv,
  RerollAnonymousNameButton,
  SignOutButton,
  Unauthenticated,
} from '../components/Auth';
import { CanvasGridBg } from '../components/CanvasGridBg';
import { EditMessageButton } from '../components/EditMessageButton';
import { Layout } from '../components/Layout';
import { A } from '@solidjs/router';
import { SideQuestPointCount } from '../components/SideQuestPointCount';
import { TimelineDate } from '../components/TimelineDate';
import { FoodGame } from '../components/FoodGame';
import { Canvas } from '../components/Canvas';

type Progress = RouterOutput['homepage']['sideQuestProgress'][0]['progress'];
type Times = RouterOutput['homepage']['times'];
const LeaderboardCanvas: Component<{ progress: Progress; times: Times }> = (props) => {
  const currentTime = new Date('2024-10-18T23:00:00.000Z').getTime();
  const hackathonStart = new Date(props.times.codingStart).getTime();
  const hackathonEnd = new Date(props.times.codingEnd).getTime();
  const easyPuzzleComplete = new Date('2024-10-19T19:30:00.000Z').getTime();

  const categories = ['algorithms', 'forensics', 'hacking', 'logic', 'puzzles'] as const;
  const difficultyLevels = ['easy', 'hard'] as const;

  const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const now = performance.now();
    const drawingArea = canvas.getBoundingClientRect();

    // clear the background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, drawingArea.width, drawingArea.height);

    // draw moving dots
    const pixelsPerSecond = 4;
    const pixelsBetweenDots = 10;
    const radius = 1;
    for (let i = 0; i < Math.ceil(drawingArea.width / pixelsBetweenDots) + 1; i++) {
      const xOffset = ((now * pixelsPerSecond) / 1000) % pixelsBetweenDots;
      const x = i * pixelsBetweenDots - xOffset;
      const y = drawingArea.height / 2 - radius;
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.roundRect(x, y, radius * 2, radius * 2, radius);
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.restore();
    }

    //draw char backgrounds
    const padding = 2;
    const fontHeight = 16 as const;
    const fontWidth = ctx.measureText(' ').width;
    const range = hackathonEnd - hackathonStart;
    const easyPuzzleCompletedPercent = (easyPuzzleComplete - hackathonStart) / range;

    ctx.save();
    ctx.translate(-fontWidth / 2, 0);
    ctx.fillStyle = '#020617';
    for (const category of categories) {
      for (const difficulty of difficultyLevels) {
        const isoDate = props.progress[category][difficulty];
        if (!isoDate) continue;
        const timestamp = new Date(isoDate).getTime();
        const percent = Math.abs(timestamp - hackathonStart) / range;
        const x = Math.floor(percent * drawingArea.width);
        ctx.fillRect(x - padding, 0 - padding, fontWidth + padding * 2, fontHeight + padding * 2);
      }
    }
    ctx.restore();

    // draw characters
    ctx.font = `bold ${fontHeight}px Zed`;
    ctx.save();
    ctx.translate(-fontWidth / 2, 0);

    for (const category of categories) {
      for (const difficulty of difficultyLevels) {
        const isoDate = props.progress[category][difficulty];
        if (!isoDate) continue;
        const timestamp = new Date(isoDate).getTime();
        const percent = Math.abs(timestamp - hackathonStart) / range;
        const x = Math.floor(percent * drawingArea.width);
        ctx.fillStyle = difficulty === 'easy' ? '#38bdf8' : '#34d399';
        ctx.fillText(category[0] ?? '', x, 14);
      }
    }

    ctx.restore();
  };
  return <Canvas draw={draw} />;
};
{
  /*
  short       :-------------|----------F-x------Px-x----
  longestName :---------p-P-|----------S-H-------x-x----
  ^ Oct 18 7pm                                ^ Oct 20 3pm */
}

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
                      <span class="text-indigo-300">– posted by </span>
                      <strong class="font-bold">{data.publicMessage.author}</strong>
                    </cite>
                  </footer>
                </Show>
              </div>
            )}
          </Show>
          <NotTv>
            <EditMessageButton />
          </NotTv>
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
        <h2 class="font-pixel text-2xl leading-loose">timel1ne</h2>
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
        <h2 class="font-pixel text-2xl leading-loose">lead3rboard</h2>
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
            </div>
          )}
        </Show>
      </BlurrySection>
      <BlurrySection section="side quests">
        <h2 class="font-pixel text-2xl leading-loose">side que5ts</h2>
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
      <BlurrySection section="food game">
        <h2 class="font-pixel text-2xl leading-loose">f0od game!</h2>
        <Show when={home.data} fallback="..." keyed>
          {(data) => <FoodGame title={data.foodGame.title} items={data.foodGame.items} />}
        </Show>
      </BlurrySection>
      <div class="grid gap-2">
        <BlurrySection section="rules">
          <h2 class="font-pixel text-2xl leading-loose">info</h2>
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">hackathon rules</h3>
          <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
            <li>you can work solo or in teams, or just contribute to random projects.</li>
            <li>
              all code and assets must be created during the hackathon. but libraries, frameworks, and engines are ok.
            </li>
            <li>no obligation to stay in the house, but this website only runs on austin's wifi!</li>
            <li>you can ask for hints in order to solve any side quest, but you won't get any points for it.</li>
          </ol>
        </BlurrySection>
        <BlurrySection section="points">
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">points</h3>
          <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
            <li>the person with the most points wins the hackathon.</li>
            <li>each easy side quest is worth 1 point.</li>
            <li>each hard side quest is worth 2 points.</li>
            <li>project voting will also award points.</li>
          </ul>
        </BlurrySection>
        <BlurrySection section="voting">
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">voting</h3>
          <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
            <li>after demos, voting opens on this site.</li>
            <li>everyone anonymously ranks the other projects.</li>
            <li>
              for each ranking we award{' '}
              <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                [# projects] – [ranking]
              </code>{' '}
              points to that project.
            </li>
          </ul>
        </BlurrySection>
        <BlurrySection section="prizes">
          <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">prizes</h3>
          <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
            <li>tbd</li>
          </ul>
        </BlurrySection>
      </div>

      <footer class="border-t border-indigo-500/30 pt-8">
        <Authenticated>{() => <SignOutButton />}</Authenticated>
      </footer>
    </Layout>
  );
}

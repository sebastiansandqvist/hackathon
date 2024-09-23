import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import {
  Authenticated,
  AuthForm,
  CanvasGridBg,
  Layout,
  RerollAnonymousNameButton,
  SectionHeading,
  SignOutButton,
  Unauthenticated,
  Uppercase,
} from '~/components';
import { Countdown } from '../Home/components/Countdown';
import { Hourglass, Laptop, Magnifier } from '~/icons';

export function Invitation() {
  const codingStart = new Date('2024-10-18T19:00:00.000-07:00').toISOString();
  return (
    <Layout>
      <Countdown time={new Date(codingStart)} />
      <hr class="border-indigo-500/30" />
      <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl">
        <GlitchText text="you are invited!" />
      </h1>
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
      <p class="text-indigo-300">
        you are cordially invited to a <strong class="text-white">hackathon</strong> starting{' '}
        <time class="font-bold text-white">friday, october 18th @7pm</time> ending in the afternoon on{' '}
        <time class="font-bold text-white">sunday, october 20th</time>.
      </p>
      <ul class="my-4 grid gap-4 sm:grid-cols-3">
        <li>
          <CanvasGridBg>
            <div class="flex flex-col items-center gap-4 p-4">
              <Hourglass class="h-12 w-12 text-indigo-200" />
              <p class="text-center font-bold">create a project over one weekend</p>
            </div>
          </CanvasGridBg>
        </li>
        <li>
          <CanvasGridBg>
            <div class="flex flex-col items-center gap-4 p-4">
              <Laptop class="h-12 w-12 text-indigo-200" />
              <p class="text-center font-bold">
                work solo <br />
                or in teams
              </p>
            </div>
          </CanvasGridBg>
        </li>
        <li>
          <CanvasGridBg>
            <div class="flex flex-col items-center gap-4 p-4">
              <Magnifier class="h-12 w-12 text-indigo-200" />
              <p class="text-center font-bold">solve side quest puzzles</p>
            </div>
          </CanvasGridBg>
        </li>
      </ul>
      <hr class="border-indigo-500/30" />
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <div class="grid gap-2">
        <SectionHeading>hackathon info</SectionHeading>
        <Uppercase as="h3" class="mt-4">
          logistics
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>bring your own laptop</li>
          <li>visit and leave the house as you please</li>
          <li>
            feel free to spend nights here
            <ul>
              {' '}
              <li class="text-indigo-300">(we have air matresses, couches, and spare rooms!)</li>{' '}
            </ul>
          </li>
          <li>we'll probably take climbing breaks</li>
          <li>food tbd</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          side quests
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>optional puzzles that include logic, programming, and hacking</li>
          <li>similar to advent of code and capture the flag problems</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          projects
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>work solo or in teams, or just contribute to random projects</li>
          <li>theme decided at hackathon start</li>
          <li>all code and assets must be created during the hackathon</li>
          <li>libraries, scaffolding commands, ai codegen, and game engines are allowed</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          voting
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>after demos, voting opens on this site</li>
          <li>everyone anonymously ranks the other projects according to:</li>
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
        </ul>
      </div>
      <Authenticated>
        <hr class="border-indigo-500/30" />
        <div>
          <SignOutButton />
        </div>
      </Authenticated>
    </Layout>
  );
}

function GlitchText(props: { text: string }) {
  const [glitchText, setGlitchText] = createSignal(props.text);

  const loopFrequency = 2000;
  const glitchFrequency = 100;
  let outterInterval: ReturnType<typeof setInterval>;
  let innerInterval: ReturnType<typeof setInterval>;
  let timeout: ReturnType<typeof setTimeout>;
  createEffect(() => {
    outterInterval = setInterval(() => {
      let charToGlitch = null;
      while (!charToGlitch) {
        const letCh = Math.floor(Math.random() * glitchText().length);
        if (glitchText()[letCh] !== ' ') {
          charToGlitch = letCh;
        }
      }

      innerInterval = setInterval(() => {
        const newText = glitchText().split('');
        const possibilites =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?~`-=[];',./".split('');
        newText[charToGlitch] = possibilites[Math.floor(Math.random() * possibilites.length)] || 'A';
        setGlitchText(newText.join(''));
      }, glitchFrequency);

      timeout = setTimeout(() => {
        clearInterval(innerInterval);
        setGlitchText(props.text);
      }, loopFrequency / 2);
    }, loopFrequency);
  });

  onCleanup(() => {
    clearInterval(outterInterval);
    clearInterval(innerInterval);
    clearTimeout(timeout);
  });

  return <span>{glitchText()}</span>;
}

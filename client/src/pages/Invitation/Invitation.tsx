import { Authenticated, AuthForm, CanvasGridBg, Layout, SignOutButton, Unauthenticated, Uppercase } from '~/components';
import { Countdown } from '../Home/components/Countdown';
import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Hourglass } from '../../icons/Hourglass';
import { Laptop } from '../../icons/Laptop';
import { Magnifier } from '../../icons/Magnifier';

export function Invitation() {
  const codingStart = new Date('2024-10-18T19:00:00.000-07:00').toISOString();
  return (
    <Layout>
      <Countdown time={new Date(codingStart)} />
      <CanvasGridBg>
        <div class="p-4">
          <h1 class="font-pixel py-12 text-center text-xl sm:text-2xl md:text-3xl">
            <GlitchText text="you are invited!" />
          </h1>
        </div>
      </CanvasGridBg>
      <div>
        <b>Hackathon</b> starting <b>Friday, October 18th evening</b> and ending <b>Sunday, October 20th day</b>
        <ul class="my-4 grid gap-4 sm:grid-cols-3">
          <li class="flex flex-col items-center gap-4 border border-indigo-300/50 p-4 backdrop-blur">
            <Hourglass class="h-12 w-12 text-indigo-300" />
            <p class="text-center">create a project over one weekend</p>
          </li>
          <li class="flex flex-col items-center gap-4 border border-indigo-300/50 p-4 backdrop-blur">
            <Laptop class="h-12 w-12 text-indigo-300" />
            <p class="text-center">work solo or in teams</p>
          </li>
          <li class="flex flex-col items-center gap-4 border border-indigo-300/50 p-4 backdrop-blur">
            <Magnifier class="h-12 w-12 text-indigo-300" />
            <p class="text-center">solve side quest puzzles</p>
          </li>
        </ul>
      </div>

      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>

      <div class="grid gap-2">
        <Uppercase as="h3" class="mt-2">
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
        <div>
          <SignOutButton />
        </div>
      </Authenticated>
    </Layout>
  );
}

function GlitchText(props: { text: string; class?: string }) {
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

  return <span class={props.class}>{glitchText()}</span>;
}

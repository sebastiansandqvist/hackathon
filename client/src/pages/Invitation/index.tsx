import { Layout } from '../../components/Layout';
import { CanvasGridBg } from '../../components/CanvasGridBg';
import { Uppercase } from '../../components/Text';
import { Countdown } from '../Home/components/Countdown';
import { createEffect, createSignal, onCleanup } from 'solid-js';

export function Invitation() {
  const codingStart = new Date('2024-10-18T19:00:00.000-07:00').toISOString();
  return (
    <Layout>
      <Countdown time={new Date(codingStart)} />
      <CanvasGridBg>
        <div class="p-4">
          <h1 class="font-pixel text-center text-2xl">
            <GlitchText text="YOU ARE INVITED" />
          </h1>
        </div>
      </CanvasGridBg>
      <div>
        <b>Hackathon</b> starting <b>Friday, October 18th evening</b> and ending <b>Sunday, October 20th day</b>
        <ul class="my-4 grid list-outside list-disc gap-4 px-10 marker:text-indigo-300/75">
          <li>🛠️ create a project over one weekend</li>
          <li>🧑‍💻 work solo or in teams</li>
          <li>🧠 solve side quest puzzles</li>
        </ul>
      </div>

      <div class="grid gap-2">
        <Uppercase as="h3" class="mt-2">
          logistics
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
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
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>optional puzzles that include logic, programming, and hacking</li>
          <li>similar to advent of code and capture the flag problems</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          projects
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>work solo or in teams, or just contribute to random projects</li>
          <li>theme decided at hackathon start</li>
          <li>all code and assets must be created during the hackathon</li>
          <li>libraries, scaffolding commands, ai codegen, and game engines are allowed</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          voting
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
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
      <CanvasGridBg>
        <div class="p-4">
          <h1 class="font-pixel text-center text-2xl">
            <GlitchText text="REGISTRATION OPENS 2024-10-11" />
          </h1>
        </div>
      </CanvasGridBg>
    </Layout>
  );
}

function GlitchText(props: { text: string }) {
  const [glitchText, setGlitchText] = createSignal(props.text);

  const loopFrequency = 2000;
  const glitchFrequency = 100;
  let outterInterval: NodeJS.Timeout;
  let innerInterval: NodeJS.Timeout;
  let timeout: NodeJS.Timeout;
  createEffect(() => {
    outterInterval = setInterval(() => {
      const charToGlitch = Math.floor(Math.random() * glitchText().length);

      innerInterval = setInterval(() => {
        const newText = glitchText().split('');
        newText[charToGlitch] = String.fromCharCode(Math.floor(Math.random() * 50 + 50));
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

  return <>{glitchText}</>;
}

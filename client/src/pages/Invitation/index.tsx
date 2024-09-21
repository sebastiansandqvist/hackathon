import { query, trpc } from '../../trpc';
import { Show } from 'solid-js';
import { Layout } from '../../components/Layout';
import { CanvasGridBg } from '../../components/CanvasGridBg';
import { Uppercase } from '../../components/Text';
import { Countdown } from '../Home/components/Countdown';
import { AuthForm, Unauthenticated } from '../../components/Auth';

export function Invitation() {
  const home = query('homepage', trpc.homepage, {
    refetchInterval: 5000,
  });

  return (
    <Layout>
      <Show when={home.data} keyed>
        {(data) => <Countdown time={new Date(data.times.codingStart)} />}
      </Show>
      <CanvasGridBg>
        <div class="p-4">
          <h1 class="font-pixel text-center text-2xl">YOU ARE INVITED</h1>
        </div>
      </CanvasGridBg>
      <div>
        <b>Hackathon</b> starting <b>Friday, October 18th evening</b> and ending <b>Sunday, October 20th day</b>
        <ul class="my-4 grid list-outside list-disc gap-4 px-10">
          <li>🛠️ create a project over one weekend</li>
          <li>🧑‍💻 work solo or in teams</li>
          <li>🧠 solve side quest puzzles</li>
        </ul>
      </div>

      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>

      <div class="grid gap-2">
        <Uppercase as="h3" class="mt-2">
          logistics
        </Uppercase>
        <ol class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>bring your own laptop</li>
          <li>visit and leave the house as you please</li>
          <li>
            feel free to spend nights here
            <ol>
              {' '}
              <li class="text-indigo-300">(we have air matresses, couches, and spare rooms!)</li>{' '}
            </ol>
          </li>
          <li>we'll probably take climbing breaks</li>
          <li>food tbd</li>
        </ol>
        <Uppercase as="h3" class="mt-2">
          side quests
        </Uppercase>
        <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>optional puzzles that include logic, programming, and hacking</li>
          <li>similar to advent of code and capture the flag problems</li>
        </ol>
        <Uppercase as="h3" class="mt-2">
          projects
        </Uppercase>
        <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>work solo or in teams, or just contribute to random projects</li>
          <li>theme decided at hackathon start</li>
          <li>all code and assets must be created during the hackathon</li>
          <li>libraries, scaffolding commands, ai codegen, and game engines are all ok to use</li>
        </ol>
        <Uppercase as="h3" class="mt-2">
          voting
        </Uppercase>
        <ol class="grid list-outside list-decimal gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
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
        </ol>
      </div>
    </Layout>
  );
}

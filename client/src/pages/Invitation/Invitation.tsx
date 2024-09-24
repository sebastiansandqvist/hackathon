import { createSignal, Show, type Component } from 'solid-js';
import {
  Authenticated,
  AuthForm,
  ButtonPrimary,
  CanvasGridBg,
  flashMessage,
  Glitch,
  Input,
  Layout,
  RerollAnonymousNameButton,
  SectionHeading,
  SignOutButton,
  Unauthenticated,
  Uppercase,
} from '~/components';
import { Hourglass, Laptop, Magnifier } from '~/icons';
import { invalidate, mutate, trpc } from '~/trpc';
import { Countdown } from '../Home/components/Countdown';

const SuggestTheme: Component<{ initialThemeSuggestion: string }> = (props) => {
  const [themeSuggestion, setThemeSuggestion] = createSignal(props.initialThemeSuggestion);
  const suggestTheme = mutate(trpc.suggestTheme, {
    onSuccess() {
      flashMessage('saved!');
      invalidate('status');
    },
  });

  return (
    <form
      class="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        suggestTheme.mutate({ theme: themeSuggestion() });
      }}
    >
      <Input
        type="text"
        placeholder="your suggestion..."
        value={themeSuggestion()}
        onInput={(e) => setThemeSuggestion(e.currentTarget.value)}
      />
      <ButtonPrimary
        type="submit"
        disabled={
          suggestTheme.isPending || themeSuggestion() === '' || themeSuggestion() === props.initialThemeSuggestion
        }
      >
        save
      </ButtonPrimary>
    </form>
  );
};

export function Invitation() {
  const codingStart = new Date('2024-10-18T19:00:00.000-07:00').toISOString();
  return (
    <Layout>
      <Countdown time={new Date(codingStart)} />
      <hr class="border-indigo-500/30" />
      <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl">
        <Glitch>you are invited!</Glitch>
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
      <div class="my-4 grid gap-4 sm:grid-cols-3">
        <CanvasGridBg>
          <div class="flex flex-col items-center gap-4 p-4">
            <Hourglass class="h-12 w-12 text-indigo-200" />
            <p class="text-center font-bold">create a project over one weekend</p>
          </div>
        </CanvasGridBg>
        <CanvasGridBg>
          <div class="flex flex-col items-center gap-4 p-4">
            <Laptop class="h-12 w-12 text-indigo-200" />
            <p class="text-center font-bold">
              work solo <br />
              or in teams
            </p>
          </div>
        </CanvasGridBg>
        <CanvasGridBg>
          <div class="flex flex-col items-center gap-4 p-4">
            <Magnifier class="h-12 w-12 text-indigo-200" />
            <p class="text-center font-bold">solve side quest puzzles</p>
          </div>
        </CanvasGridBg>
      </div>
      <hr class="border-indigo-500/30" />
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <Authenticated>
        {({ themeSuggestion }) => (
          <>
            <section class="grid gap-4">
              <SectionHeading>
                <Glitch loopFrequency={40000}>theme</Glitch>
              </SectionHeading>
              <p class="text-indigo-300">
                help us pick this year's hackathon theme! we're looking for something that works for{' '}
                <strong>apps</strong>, <strong>websites</strong>, and <strong>games</strong>. some ideas to get you
                started:
              </p>
              <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
                <li>cooperation / asymmetry</li>
                <li>technologize your non-tech hobby</li>
                <li>impermanent</li>
                <li>limited information</li>
                <li>randomness</li>
                <li>
                  <SuggestTheme initialThemeSuggestion={themeSuggestion} />
                </li>
              </ul>
            </section>
            <hr class="border-indigo-500/30" />
          </>
        )}
      </Authenticated>
      <section class="grid gap-2">
        <SectionHeading>
          <Glitch loopFrequency={20000}>hackathon info</Glitch>
        </SectionHeading>
        <Uppercase as="h3" class="mt-4">
          <Glitch loopFrequency={30000}>logistics</Glitch>
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
          <Glitch loopFrequency={45000}>side quests</Glitch>
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>optional puzzles that include logic, programming, and hacking</li>
          <li>similar to advent of code and capture the flag problems</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          <Glitch loopFrequency={25000}>projects</Glitch>
        </Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 pl-10 text-indigo-100 marker:text-indigo-300/75">
          <li>work solo or in teams, or just contribute to random projects</li>
          <li>theme decided at hackathon start</li>
          <li>all code and assets must be created during the hackathon</li>
          <li>libraries, scaffolding commands, ai codegen, and game engines are allowed</li>
        </ul>
        <Uppercase as="h3" class="mt-2">
          <Glitch loopFrequency={38000}>voting</Glitch>
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
      </section>
      <Authenticated>
        <hr class="border-indigo-500/30" />
        <div>
          <SignOutButton />
        </div>
      </Authenticated>
    </Layout>
  );
}

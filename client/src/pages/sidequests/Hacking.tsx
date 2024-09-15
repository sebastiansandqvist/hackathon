import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';
import { Authenticated } from '../../components/Auth';
import { Show } from 'solid-js';

export function Hacking() {
  return (
    <Layout>
      <div class="grid gap-4">
        <h1 class="font-quill text-8xl">Hacking – Part 1</h1>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Background:</h2>
        <p class="text-indigo-100">
          oh no! someone appears to have used a hard-coded password in the homepage message editor. show them why that's
          a bad idea by leaving your own message for everyone to see.
        </p>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Your objective, for 1 point:</h2>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>locate the password</li>
          <li>edit the homepage message</li>
        </ul>
        <Authenticated>
          {({ sideQuests }) => (
            <Show when={sideQuests.hacking.easy}>
              <h1 class="font-quill text-8xl">Hacking – Part 2</h1>
              <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Background:</h2>
              <p class="text-indigo-100">
                the admins learned a bit about security and used hashing to keep their password safe. but maybe they're
                not as good as they think. through social engineering, we got them to brag about the security practices
                they're using to keep their password safe.
              </p>
              <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">here's what we've learned:</h2>
              <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                <li>they rotate their password every week</li>
                <li>the password is always at least 8 characters long</li>
                <li>
                  it's picked at random from a{' '}
                  <a href="/dictionary/words.txt" download class="underline transition hover:text-white">
                    list of 479k english words
                  </a>
                </li>
              </ul>
              <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Your objective, for 2 points:</h2>
              <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                <li>locate the hashed admin password</li>
                <li>identify the hashing algorithm in use</li>
                <li>crack the password</li>
                <li>
                  as admins are the only ones who can add images, you'll need to add an HTML image to the homepage using
                  the cracked password. any image from the web will do! for example,
                  <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                    &lt;img src="https://wikipedia.org/.../example.png" /&gt;
                  </code>
                </li>
              </ul>
            </Show>
          )}
        </Authenticated>
        <footer class="border-t border-indigo-500/30 pt-8">
          <A href="/">
            <ButtonPrimary>
              <span class="not-italic">&larr;</span> back
            </ButtonPrimary>
          </A>
        </footer>
      </div>
    </Layout>
  );
}

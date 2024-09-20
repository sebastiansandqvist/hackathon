import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';
import { Authenticated } from '../../components/Auth';
import { Show } from 'solid-js';
import { Title, Uppercase } from '../../components/Text';

export function Hacking() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Title>Hacking – Part 1</Title>
        <Uppercase>background:</Uppercase>
        <p class="text-indigo-100">
          oh no! someone appears to have left the password to the homepage message editor in plain sight. find it, and
          leave a message for everyone to see.
        </p>
        <Uppercase>your objective, for 1 point:</Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>locate the password</li>
          <li>edit the homepage message</li>
        </ul>
        <Authenticated>
          {({ sideQuests }) => (
            <Show when={sideQuests.hacking.easy}>
              <hr class="border-indigo-500/30" />
              <Title>Hacking – Part 2</Title>
              <Uppercase>background:</Uppercase>
              <p class="text-indigo-100">
                the admins learned a bit about security and used hashing to keep their password safe. but maybe they're
                not as good as they think. through social engineering, we got them to brag about the security practices
                they're using to keep their password safe.
              </p>
              <Uppercase>here's what we've learned:</Uppercase>
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
              <Uppercase>your objective, for 2 points:</Uppercase>
              <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                <li>locate the hashed admin password</li>
                <li>identify the hashing algorithm in use</li>
                <li>crack the password</li>
                <li>use your admin password to add an image to the homepage</li>
              </ul>
            </Show>
          )}
        </Authenticated>
        <footer class="border-t border-indigo-500/30 pt-8">
          <A href="/">
            <ButtonPrimary>
              <span class="font-dot not-italic">&lt;</span> back
            </ButtonPrimary>
          </A>
        </footer>
      </div>
    </Layout>
  );
}

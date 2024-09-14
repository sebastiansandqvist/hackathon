import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';

export function Hacking() {
  return (
    <Layout>
      <div class="grid gap-4">
        <h1 class="font-quill text-8xl">Hacking – Part 1</h1>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Background:</h2>
        <p>
          (todo) make up some storyline for the hacking side quest. something about how website moderators are the ones
          who set the homepage message, but they're not great at security and their password is easy to find. we
          (security experts) have been asking them to be more secure with their passwords, but they're not listening.
          let's give them a scare and show them that hard-coded passwords aren't going to cut it. edit the message on
          their homepage to show them that they're vulnerable. (maybe include a link to CVE we submitted to the admins?)
        </p>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Your objective, for 1 point:</h2>
        <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>locate the password</li>
          <li>edit the homepage message</li>
        </ul>

        <h1 class="font-quill text-8xl">Hacking – Part 2</h1>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Background:</h2>
        <p>
          although the moderators aren't great at security, the admins did a bit better and learned about password
          hashing. but maybe they're not as good as they think. through social engineering, we got them to brag about
          the security practices they're using to keep their password safe. that is: - they rotate their password every
          week - the password is always at least 8 characters long - it's picked at random from a{' '}
          <a href="/dictionary/words.txt" download class="underline">
            list of 479k english words
          </a>
          . your objective, for 2 points: and edit the homepage message to include an HTML image.
        </p>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Your objective, for 2 points:</h2>
        <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>locate the hashed admin password</li>
          <li>crack the password</li>
          <li>
            add an HTML image to the homepage using the cracked password. for example,
            <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
              &lt;img src="https://wikipedia.org/.../example.png" /&gt;
            </code>
          </li>
        </ul>
      </div>
      <footer class="border-t border-indigo-500/30 pt-8">
        <A href="/">
          <ButtonPrimary>
            <span class="not-italic">&larr;</span> back
          </ButtonPrimary>
        </A>
      </footer>
    </Layout>
  );
}

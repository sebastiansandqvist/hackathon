import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';

export function Hacking() {
  return (
    <Layout>
      <div class="grid gap-4">
        <p class="mt-2 uppercase tracking-widest text-indigo-300/75">easy:</p>
        <p>edit the message on the homepage.</p>
        <p class="mt-2 uppercase tracking-widest text-indigo-300/75">hard:</p>
        <p>
          post an image to the homepage.{' '}
          <span class="text-sm text-indigo-300/75">
            (<span class="cursor-progress">hint</span>)
          </span>
        </p>
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

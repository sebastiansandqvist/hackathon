import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';

export function Forensics() {
  return (
    <Layout>
      <div class="grid gap-4">
        <h1 class="font-quill text-8xl">Forensics – Part 1</h1>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">...:</h2>
        <p>(todo)</p>
        <img src="/images/holmes.jpg" />

        <h1 class="font-quill text-8xl">Forensics – Part 2</h1>
        <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">TODO:</h2>
        <p>(todo)</p>
        <img src="/images/poirot.bmp" />
        <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>todo</li>
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

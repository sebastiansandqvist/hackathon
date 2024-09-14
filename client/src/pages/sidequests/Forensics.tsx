import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';
import { Authenticated, Unauthenticated } from '../../components/Auth';
import { Show } from 'solid-js';
import { AnswerForm } from './components/AnswerForm';

function EasyForensics() {
  return (
    <>
      <h1 class="font-quill text-8xl">Forensics – Part 1</h1>
      <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">Metadata analysis:</h2>
      <p>on what island was this picture taken?</p>
      <img src="/images/holmes.jpg" />
    </>
  );
}

export function Forensics() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Unauthenticated>
          <EasyForensics />
        </Unauthenticated>
        <Authenticated>
          {({ sideQuests }) => (
            <>
              <Show when={sideQuests.puzzles.hard || !sideQuests.puzzles.easy}>
                <EasyForensics />
                <Show when={sideQuests.puzzles.easy}>
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show when={sideQuests.puzzles.easy} fallback={<AnswerForm answerCharCount={4} difficulty="easy" />}>
                <h1 class="font-quill text-8xl">Forensics – Part 2</h1>
                <h2 class="mt-2 uppercase tracking-widest text-indigo-300/75">TODO:</h2>
                <p>(todo)</p>
                <img src="/images/poirot.bmp" class="pixelated w-[400px]" />
                <ul class="grid list-outside list-disc gap-4 pt-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                  <li>todo</li>
                </ul>
                <Show when={!sideQuests.puzzles.hard}>
                  <AnswerForm answerCharCount={10} difficulty="hard" />
                </Show>
              </Show>
            </>
          )}
        </Authenticated>
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

import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Layout, ButtonPrimary, Authenticated, Unauthenticated, Title, Uppercase } from '~/components';
import { AnswerForm } from '../components/AnswerForm';
import { Synth } from './Synth';
import { SlidePuzzle } from './SlidePuzzle';

function EasyLogic() {
  return (
    <>
      <Title>Logic – Part 1</Title>
      <Uppercase>self-reflection:</Uppercase>
      <SlidePuzzle />
    </>
  );
}

export function Logic() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Unauthenticated>
          <EasyLogic />
        </Unauthenticated>
        <Authenticated>
          {({ sideQuests }) => (
            <>
              <Show when={sideQuests.logic.hard || !sideQuests.logic.easy}>
                <EasyLogic />
                <Show when={sideQuests.logic.easy}>
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show when={sideQuests.logic.easy}>
                <Title>Logic – Part 2</Title>
                <Uppercase>heading:</Uppercase>
                <p class="text-indigo-100">(background)</p>
                <Uppercase>heading:</Uppercase>
                <Synth />
                <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                  <li>more info</li>
                  <li>
                    an example with code:
                    <pre class="italic text-indigo-300">
                      <code>
                        {`
function foo() {
  return 'bar';
}`}
                      </code>
                    </pre>
                  </li>
                </ul>
                <Show when={!sideQuests.logic.hard}>
                  <AnswerForm answerCharCount={4} difficulty="hard" category="logic" />
                </Show>
              </Show>
            </>
          )}
        </Authenticated>
      </div>

      <footer class="border-t border-indigo-500/30 pt-8">
        <A href="/">
          <ButtonPrimary>
            <span class="font-dot not-italic">&lt;</span> back
          </ButtonPrimary>
        </A>
      </footer>
    </Layout>
  );
}

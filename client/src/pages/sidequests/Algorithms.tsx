import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';
import { Authenticated, Unauthenticated } from '../../components/Auth';
import { Show } from 'solid-js';
import { AnswerForm } from './components/AnswerForm';
import { Title, Uppercase } from '../../components/Text';

function EasyAlgorithms() {
  return (
    <>
      <Title>Algorithms – Part 1</Title>
      <Uppercase>heading:</Uppercase>
      <p class="text-indigo-100">(backstory)</p>
      <Uppercase>another heading:</Uppercase>
      <p class="text-indigo-100">(prompt)</p>
    </>
  );
}

export function Algorithms() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Unauthenticated>
          <EasyAlgorithms />
        </Unauthenticated>
        <Authenticated>
          {({ sideQuests }) => (
            <>
              <Show when={sideQuests.algorithms.hard || !sideQuests.algorithms.easy}>
                <EasyAlgorithms />
                <Show when={sideQuests.algorithms.easy}>
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show
                when={sideQuests.algorithms.easy}
                fallback={<AnswerForm answerCharCount={4} difficulty="easy" category="algorithms" />}
              >
                <Title>Algorithms – Part 2</Title>
                <Uppercase>heading:</Uppercase>
                <p class="text-indigo-100">(background)</p>
                <Uppercase>heading:</Uppercase>
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
                <Show when={!sideQuests.algorithms.hard}>
                  <AnswerForm answerCharCount={4} difficulty="hard" category="algorithms" />
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

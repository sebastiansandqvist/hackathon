import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Layout, ButtonPrimary, Authenticated, Unauthenticated, Title, Uppercase } from '~/components';
import { AnswerForm } from '../components/AnswerForm';
import { SlidePuzzle } from './SlidePuzzle';
import { SoundPuzzle } from './Synth';

function EasyLogic() {
  return (
    <>
      <Title>Logic – Part 1</Title>
      <Uppercase>
        <q>.NET lullaby</q>:
      </Uppercase>
      <SoundPuzzle />
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
                <Show
                  when={sideQuests.logic.easy}
                  fallback={<AnswerForm answerCharCount={4} difficulty="easy" category="logic" />}
                >
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show when={sideQuests.logic.easy}>
                <Title>Logic – Part 2</Title>
                <Uppercase>
                  <q>self-reflection</q>:
                </Uppercase>
                <SlidePuzzle />
                <Uppercase>tip:</Uppercase>
                <p>
                  we've left you a few functions on the <code>window</code> object!
                </p>
                <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                  <li>
                    <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                      getBoard()
                    </code>
                    <p class="text-sm italic">(the current order of the tiles on the board)</p>
                  </li>
                  <li>
                    <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                      isSorted()
                    </code>
                  </li>
                  <li>
                    <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                      validMoves()
                    </code>
                    <p class="text-sm italic">(an array of valid move indexes)</p>
                  </li>
                  <li>
                    <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                      attemptMove(n: number)
                    </code>
                    <p class="text-sm italic">(attempt to move the tile at a given index into the empty slot)</p>
                  </li>
                </ul>
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

import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { writeClipboard } from '@solid-primitives/clipboard';
import { Layout } from '../../components/Layout';
import { ButtonPrimary, ButtonSecondary } from '../../components/Button';
import { CanvasGridBg } from '../../components/CanvasGridBg';
import { Authenticated, Unauthenticated } from '../../components/Auth';
import { AnswerForm } from './components/AnswerForm';
import { Title, Uppercase } from '../../components/Text';

function EasyPuzzle() {
  return (
    <div class="grid gap-4">
      <Title>First Puzzle</Title>
      <Uppercase>
        <q>out of place(holder)</q>
      </Uppercase>
      <p class="text-indigo-200">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniams, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eay commodo
        consequat. Duis auste irure dolor in reprethenderit in voluptate velite esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officima deserunt mollit anim id est
        laborum.
      </p>
    </div>
  );
}

const hardPuzzleRawText = `he does not become angry when the system crashes,
but accepts the uniVerse wIthout Concern.
he has gone beyond the need for documentation;
he no longer cares if anyone else sees his code.
he  has gone beyond the need fOr testing;
each of his  programs are perfect within themselves,
sereNe and elegant, their purpose self-evident.
truly, he has entered the mystery of tao."
`;

export function Puzzles() {
  return (
    <Layout>
      <Unauthenticated>
        <EasyPuzzle />
      </Unauthenticated>
      <Authenticated>
        {({ sideQuests }) => (
          <>
            <Show when={sideQuests.puzzles.hard || !sideQuests.puzzles.easy}>
              <EasyPuzzle />
              <Show when={sideQuests.puzzles.easy}>
                <hr class="border-indigo-500/30" />
              </Show>
            </Show>
            <Show
              when={sideQuests.puzzles.easy}
              fallback={<AnswerForm category="puzzles" answerCharCount={6} difficulty="easy" />}
            >
              <div class="grid gap-4">
                <Title>Hard Puzzle</Title>
                <Uppercase>a novice asked the master:</Uppercase>
                <p class="text-indigo-200">
                  "here is a programmer that never designs, documents or tests his programs. yet all who know him
                  consider him one oF the best progrAmmers in the world. why is this?"
                </p>
                <Uppercase>the master replied:</Uppercase>
                <p class="text-indigo-200">
                  "that programmer has mastered the tao. he has gone beyond the need for design.
                </p>
                <div class="group relative border-l-2 border-indigo-500 py-2 pl-4">
                  <div class="absolute top-0 right-0 opacity-0 transition group-hover:opacity-100">
                    <ButtonSecondary onClick={() => writeClipboard(hardPuzzleRawText)}>copy</ButtonSecondary>
                  </div>
                  <p>
                    he does not become angry when the{' '}
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>system c</CanvasGridBg>
                    </span>
                    rashes,
                  </p>
                  <p>
                    but accepts the{' '}
                    <span class="inline-flex border-b-2 border-indigo-500/50">
                      <CanvasGridBg>uniVerse</CanvasGridBg>
                    </span>{' '}
                    wIthout Concern.
                  </p>
                  <p>
                    he has gone beyond the need for{' '}
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>document</CanvasGridBg>
                    </span>
                    ation;
                  </p>
                  <p>
                    he no longer cares if anyone else{' '}
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>sees his</CanvasGridBg>
                    </span>{' '}
                    code.
                  </p>
                  <p>
                    he{' '}
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>has gone</CanvasGridBg>
                    </span>{' '}
                    beyond the need fOr testing;
                  </p>
                  <p>
                    each of his{' '}
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>programs</CanvasGridBg>
                    </span>{' '}
                    are perfect within themselves,
                  </p>
                  <p>
                    sereNe and elegant, their purpose self
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>-evident</CanvasGridBg>
                    </span>
                    .
                  </p>
                  <p>
                    truly, he has entered the myste
                    <span class="inline-flex border-b-2 border-b-indigo-500/50">
                      <CanvasGridBg>ry of ta</CanvasGridBg>
                    </span>
                    o."
                  </p>
                </div>
              </div>
              <Show when={!sideQuests.puzzles.hard}>
                <AnswerForm category="puzzles" difficulty="hard" answerCharCount={12} />
              </Show>
            </Show>
          </>
        )}
      </Authenticated>
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

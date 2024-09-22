import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Authenticated, Unauthenticated, ButtonPrimary, CopyButton, Layout, Title, Uppercase } from '~/components';
import { AnswerForm } from './components/AnswerForm';

const easyInput = `i1 h42 a47 a56 x59-63`;

function EasyGraphics() {
  return (
    <>
      <Title>Graphics – Part 1</Title>
      <Uppercase>
        <q>name that color!</q>
      </Uppercase>
      <p class="text-indigo-100">
        what{' '}
        <a class="underline transition hover:text-white" href="https://colornamer.robertcooper.me/">
          color
        </a>{' '}
        is described by the following sequence?
      </p>
      <pre class="w-full overflow-x-auto text-nowrap bg-indigo-950/75 p-6">
        <code>{easyInput}</code>
      </pre>
      <img src="/images/lovelace.webp" class="w-full" />
    </>
  );
}

export function Graphics() {
  return (
    <Layout>
      <div class="grid gap-4">
        <Unauthenticated>
          <EasyGraphics />
        </Unauthenticated>
        <Authenticated>
          {({ sideQuests }) => (
            <>
              <Show when={sideQuests.graphics.hard || !sideQuests.graphics.easy}>
                <EasyGraphics />
                <Show when={sideQuests.graphics.easy}>
                  <hr class="border-indigo-500/30" />
                </Show>
              </Show>
              <Show when={sideQuests.graphics.easy} fallback={<AnswerForm difficulty="easy" category="graphics" />}>
                <Title>Graphics – Part 2</Title>
                <Uppercase>
                  <q>pointillism</q>
                </Uppercase>
                <p class="text-indigo-100">what do you make of this? some kind of coding?</p>
                <div class="group relative">
                  <div class="absolute top-0 right-0 opacity-0 transition group-hover:opacity-100">
                    <CopyButton input={() => getInput()} />
                  </div>
                  <textarea
                    readonly
                    class="h-[320px] w-full resize-y overflow-y-scroll border-indigo-500 p-4 outline-none transition focus:bg-indigo-950/50"
                    value={getInput()}
                    onClick={(e) => {
                      if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
                        e.currentTarget.select();
                      }
                    }}
                  />
                </div>
                <Show when={!sideQuests.graphics.hard}>
                  <AnswerForm answerCharCount={7} difficulty="hard" category="graphics" />
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

function getInput() {
  return `94, 67
131, 54
100, 61
140, 33
96, 58
41, 37
72, 54
305, 58
97, 52
36, 70
359, 33
304, 67
131, 60
190, 31
388, 37
315, 37
309, 57
132, 64
9, 49
300, 66
36, 41
140, 51
390, 31
183, 54
360, 73
196, 35
36, 37
154, 32
182, 43
235, 39
149, 35
361, 60
331, 66
377, 57
311, 45
99, 31
255, 71
72, 43
384, 66
269, 38
245, 42
90, 69
272, 57
236, 44
273, 34
247, 48
23, 51
132, 44
10, 44
358, 39
203, 49
387, 51
68, 33
389, 67
307, 52
101, 57
319, 38
38, 51
188, 35
246, 55
199, 51
275, 46
235, 55
41, 48
380, 64
372, 49
8, 70
265, 43
370, 40
132, 50
133, 34
131, 69
305, 62
271, 46
360, 49
325, 45
183, 31
273, 71
37, 56
187, 63
244, 38
257, 61
235, 31
184, 49
303, 73
19, 49
69, 57
11, 61
388, 55
260, 54
299, 71
14, 50
362, 65
100, 42
99, 35
273, 53
144, 33
101, 47
41, 55
73, 39
8, 57
73, 31
13, 72
273, 65
315, 58
157, 35
326, 54
391, 60
326, 59
13, 31
201, 33
38, 33
243, 46
86, 74
37, 62
330, 73
242, 31
236, 69
74, 66
69, 64
83, 71
27, 51
186, 43
256, 67
68, 38
366, 41
250, 60
78, 69
387, 72
129, 73
314, 42
387, 44
154, 53
261, 60
330, 61
129, 33
206, 52
191, 51
370, 44
239, 52
262, 48
206, 35
31, 50
250, 55
238, 36
235, 51
391, 44
129, 47
273, 39
96, 40
131, 40
323, 51
187, 57
41, 69
144, 52
192, 35
40, 41
335, 72
310, 41
195, 31
251, 65
364, 36
270, 50
373, 54
182, 37
11, 66
96, 48
97, 64
150, 50
362, 41
391, 50
211, 32
316, 33
10, 53
378, 53
323, 39
183, 61
239, 61
387, 59
321, 56
74, 71
358, 54
68, 49
239, 65
387, 63
186, 67
195, 53
236, 73
320, 42
265, 39
9, 37
327, 65
41, 62
358, 43
235, 63
13, 57
239, 47
361, 69
391, 71
268, 32`;
}

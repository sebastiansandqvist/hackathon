import { A } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { ButtonPrimary } from '../../components/Button';
import { Authenticated, Unauthenticated } from '../../components/Auth';
import { Show } from 'solid-js';
import { AnswerForm } from './components/AnswerForm';
import { Title, Uppercase } from '../../components/Text';

const input = `94, 67
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

function EasyAlgorithms() {
  return (
    <>
      <Title>Algorithms – Part 1</Title>
      <Uppercase>
        <q>pointillism</q>
      </Uppercase>
      <p class="text-indigo-100"></p>
    </>
  );
}

/*
const Challenge = () => {
  const [canvasElement, setCanvasElement] = createSignal<HTMLCanvasElement>();

  createEffect(() => {
    const canvas = canvasElement();
    if (!canvas) return;
    // query the canvas

    // draw our text
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context not supported');

    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillText('H U F F M A N', canvas.width / 2, canvas.height / 2 + 5);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let points = [] as {
      x: number;
      y: number;
    }[];
    const desiredPointAmount = 200;

    while (points.length < desiredPointAmount) {
      const x = Math.floor(Math.random() * canvas.width);
      const y = Math.floor(Math.random() * canvas.height);
      const pixelIndex = (y * canvas.width + x) * 4;
      const pixel = imageData.data.slice(pixelIndex, pixelIndex + 4);
      const pixelR = pixel[0];
      if (pixelR !== 255) continue;

      const circleRadius = 2;
      const overlapping = points.some((point) => {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circleRadius * 2;
      });
      if (overlapping) continue;

      points.push({ x, y });
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    (async () => {
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      for (const point of points) {
        await wait(100);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    })();

    console.log(points.map((point) => `${point.x}, ${point.y}`).join('\n'));
  });

  return <canvas ref={setCanvasElement} width="400" height="100" />;
};
*/

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
                <Uppercase>
                  <q>pointillism</q>
                </Uppercase>
                <p class="text-indigo-100">(background)</p>
                <Uppercase>heading:</Uppercase>
                <textarea class="min-h-[900px] text-white">{input}</textarea>
                <Show when={!sideQuests.algorithms.hard}>
                  <AnswerForm answerCharCount={7} difficulty="hard" category="algorithms" />
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

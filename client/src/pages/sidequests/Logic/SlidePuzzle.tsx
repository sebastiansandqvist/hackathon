import { makePersisted } from '@solid-primitives/storage';
import { onCleanup, onMount } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { flashMessage } from '~/components';
import { invalidate, mutate, trpc } from '~/trpc';
import { wait } from '~/util';

declare global {
  interface Document {
    startViewTransition(updateCallback: () => Promise<void> | void): void;
  }
  interface Window {
    validMoves: () => number[];
    getBoard: () => number[];
    attemptMove: (item: number) => boolean;
    attemptMoveByIndex: (index: number) => boolean;
    isSorted: () => boolean;
    wait: (ms: number) => Promise<unknown>;
  }
}

const inputItems: [number, string][] = [
  [3, 'j'],
  [1, 'o'],
  [0, 'g'],
  [11, 'd'],
  [4, 'ob'],
  [15, '!'],
  [6, 'a'],
  [7, 'ck'],
  [2, 'od'],
  [5, 'h'],
  [14, 't'],
  [10, 'ou'],
  [13, 'di'],
  [12, 'i'],
  [8, 'er'],
  [9, 'y'],
];

function findValidMoves(board: number[], slotIndex: number) {
  const possibilities = [slotIndex - 4, slotIndex + 4];
  const x = slotIndex % 4;
  if (x !== 0) possibilities.push(slotIndex - 1);
  if (x !== 3) possibilities.push(slotIndex + 1);
  const validMoves = possibilities.filter((index) => {
    return index >= 0 && index < board.length;
  });
  return validMoves;
}

export function SlidePuzzle() {
  const [items, setItems] = makePersisted(createSignal(inputItems.map(([i]) => i)));

  const submitPuzzle = mutate(trpc.submitSolution, {
    onError(err: Error) {
      if (err.message === 'incorrect') {
        flashMessage('incorrect', 'red');
      } else {
        alert(err.message ?? 'Unable to submit solution');
      }
    },
    async onSuccess() {
      await flashMessage('correct!');
      invalidate('homepage');
      invalidate('status');
    },
  });

  const submit = (values: number[]) => {
    const solution = values
      .map((i) => {
        const [, letter] = inputItems.find(([j]) => j === i)!;
        return letter;
      })
      .join('');
    submitPuzzle.mutate({
      category: 'logic',
      difficulty: 'easy',
      solution,
    });
  };

  let preview: HTMLVideoElement;
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  const [videoStream, setStream] = createSignal<MediaStream>();
  const slotItem = items()[0]!;
  const updateBoard = (newBoard: number[]) => {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        setItems(newBoard);
      });
    } else {
      setItems(newBoard);
    }
  };

  const isSorted = () => {
    const cells = items();
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i] !== i) return false;
    }
    return true;
  };

  const attemptMoveByIndex = (index: number) => {
    if (!validMoves().includes(index)) return false;
    const prev = items();
    const item = prev[index]!;
    const newItems = [...prev];
    [newItems[index], newItems[prev.indexOf(slotItem)]] = [slotItem, item];
    updateBoard(newItems);
    if (!isSorted()) return true;
    submit(newItems);
    return true;
  };

  const attemptMove = (item: number) => {
    const itemAttemptingToMove = items().indexOf(item);
    return attemptMoveByIndex(itemAttemptingToMove);
  };

  const validMoves = () => findValidMoves(items(), items().indexOf(slotItem));
  window['validMoves'] = validMoves;
  window['getBoard'] = () => items();
  window['attemptMove'] = attemptMoveByIndex;
  window['isSorted'] = isSorted;
  window['wait'] = wait;

  let raf: number;

  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(stream);
    preview.srcObject = stream;
    const chunkCanvases = container.querySelectorAll('canvas');
    chunkCanvases.forEach((canvas) => {
      canvas.height = 128;
      canvas.width = 128;
    });

    function render() {
      canvas.width = preview.videoWidth;
      canvas.height = preview.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);

      const minDimension = Math.min(canvas.width, canvas.height);
      const letterBoxedRect = {
        width: minDimension,
        height: minDimension,
        x: (canvas.width - minDimension) / 2,
        y: (canvas.height - minDimension) / 2,
      };

      const chunkRectSize = {
        width: letterBoxedRect.width / 4,
        height: letterBoxedRect.height / 4,
      };
      for (let i = 0; i < 16; i++) {
        const chunkCanvas = chunkCanvases[i]!;
        const item = parseInt(chunkCanvas.dataset['item']!, 10);
        const x = item % 4;
        const y = Math.floor(item / 4);
        const chunkRectPos = {
          x: letterBoxedRect.x + x * chunkRectSize.width,
          y: letterBoxedRect.y + y * chunkRectSize.height,
        };
        if (canvas.width !== 0) {
          const chunkCtx = chunkCanvas.getContext('2d')!;
          chunkCtx.clearRect(0, 0, chunkCanvas.width, chunkCanvas.height);
          chunkCtx.drawImage(
            canvas,
            chunkRectPos.x,
            chunkRectPos.y,
            chunkRectSize.width,
            chunkRectSize.height,
            0,
            0,
            128,
            128,
          );
        }
      }
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);
  });

  onCleanup(() => {
    cancelAnimationFrame(raf);
    const stream = videoStream();
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  });

  return (
    <>
      <video muted autoplay ref={preview!} class="t-0 l-0 fixed h-0 w-0" />
      <canvas ref={canvas!} class="h-0 w-0" />
      <div class="grid w-fit grid-flow-dense grid-cols-4 gap-2" ref={container!}>
        <For each={items()}>
          {(item, i) => (
            <button
              disabled={item === slotItem || !validMoves().includes(i())}
              class="bg-videocamera relative h-32 w-32 cursor-pointer disabled:cursor-default"
              classList={{
                'outline-8 outline-indigo-500': validMoves().includes(i()),
                'opacity-0': item === slotItem,
              }}
              style={{
                'view-transition-name': `slidepuzzle-${item}`,
              }}
              onClick={() => {
                attemptMove(item);
              }}
            >
              <canvas data-item={item} />
            </button>
          )}
        </For>
      </div>
    </>
  );
}

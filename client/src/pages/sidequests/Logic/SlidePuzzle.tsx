import { makePersisted, storageSync } from '@solid-primitives/storage';
import { onCleanup, onMount } from 'solid-js';
import { Show } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { Button, flashMessage } from '~/components';
import { invalidate, mutate, trpc } from '~/trpc';
import { wait } from '~/util';

declare global {
  interface Document {
    startViewTransition(updateCallback: () => Promise<void> | void): void;
  }
  interface Window {
    validMovesByIndex: () => number[];
    validMoves: () => number[];
    getBoard: () => number[];
    move: {
      down: () => boolean;
      up: () => boolean;
      left: () => boolean;
      right: () => boolean;
      toTileNumber: (tileNumber: number) => boolean;
      toIndex: (index: number) => boolean;
    };
    isSorted: () => boolean;
    wait: (ms: number) => Promise<unknown>;
  }
}

const inputTiles: [number, string][] = [
  [0, 'g'],
  [11, 'd'],
  [1, 'o'],
  [15, '!'],
  [6, 'a'],
  [2, 'od'],
  [7, 'ck'],
  [4, 'ob'],
  [5, 'h'],
  [14, 't'],
  [10, 'ou'],
  [13, 'di'],
  [3, 'j'],
  [12, 'i'],
  [8, 'er'],
  [9, 'y'],
];

function findValidMoves(board: number[], blankTileIndex: number) {
  const possibilities = [blankTileIndex - 4, blankTileIndex + 4];
  const x = blankTileIndex % 4;
  if (x !== 0) possibilities.push(blankTileIndex - 1);
  if (x !== 3) possibilities.push(blankTileIndex + 1);
  const validMoves = possibilities.filter((index) => {
    return index >= 0 && index < board.length;
  });
  return validMoves;
}

export function SlidePuzzle() {
  const [items, setItems] = makePersisted(createSignal(inputTiles.map(([i]) => i)), {
    sync: storageSync,
    name: 'slide-puzzle',
  });

  const submitPuzzle = mutate(trpc.submitSolution, {
    onError(err: Error) {
      if (err.message === 'incorrect') {
        flashMessage('incorrect', 'red');
      } else {
        alert(err.message ?? 'Unable to submit solution');
      }
    },
    async onSuccess() {
      await flashMessage('impressive!');
      invalidate('homepage');
      invalidate('status');
    },
  });

  const submit = (values: number[]) => {
    const solution = values
      .map((i) => {
        const [, letter] = inputTiles.find(([j]) => j === i)!;
        return letter;
      })
      .join('');
    console.log(solution);
    submitPuzzle.mutate({
      category: 'logic',
      difficulty: 'hard',
      solution,
    });
  };

  let preview: HTMLVideoElement;
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  const [showNumbers, setShowNumbers] = createSignal(false);

  const [videoStream, setStream] = createSignal<MediaStream>();
  const blankTile = 0;
  const updateBoard = (newBoard: number[]) => {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        setItems(newBoard);
      });
    } else {
      setItems(newBoard);
    }
  };

  const isSorted = (tiles?: number[]) => {
    const cells = tiles ?? items();
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i] !== i) return false;
    }
    return true;
  };

  const attemptMoveByIndex = (index: number) => {
    if (!validMovesByIndex().includes(index)) return false;
    const prev = items();
    const item = prev[index]!;
    const newItems = [...prev];
    [newItems[index], newItems[prev.indexOf(blankTile)]] = [blankTile, item];
    updateBoard(newItems);
    if (!isSorted(newItems)) return true;
    submit(newItems);
    return true;
  };

  const attemptMove = (item: number) => {
    const itemAttemptingToMove = items().indexOf(item);
    return attemptMoveByIndex(itemAttemptingToMove);
  };

  const moveUp = () => {
    const blankTileIndex = items().indexOf(blankTile);
    const targetTile = items()[blankTileIndex - 4];
    if (targetTile === undefined) return false;
    return attemptMove(targetTile);
  };

  const moveDown = () => {
    const blankTileIndex = items().indexOf(blankTile);
    const targetTile = items()[blankTileIndex + 4];
    if (targetTile === undefined) return false;
    return attemptMove(targetTile);
  };

  const moveRight = () => {
    const blankTileIndex = items().indexOf(blankTile);
    if (blankTileIndex % 4 === 3) return false; // prevent wrapping
    const targetTile = items()[blankTileIndex + 1];
    if (targetTile === undefined) return false;
    return attemptMove(targetTile);
  };

  const moveLeft = () => {
    const blankTileIndex = items().indexOf(blankTile);
    if (blankTileIndex % 4 === 0) return false; // prevent wrapping
    const targetTile = items()[blankTileIndex - 1];
    if (targetTile === undefined) return false;
    return attemptMove(targetTile);
  };

  const validMovesByIndex = () => findValidMoves(items(), items().indexOf(blankTile));
  const validMovesByTile = () => validMovesByIndex().map((i) => items()[i]!);

  window['validMovesByIndex'] = validMovesByIndex;
  window['validMoves'] = validMovesByTile;
  window['getBoard'] = () => items();
  window['move'] = {
    down: moveDown,
    up: moveUp,
    left: moveLeft,
    right: moveRight,
    toTileNumber: attemptMove,
    toIndex: attemptMoveByIndex,
  };
  window['isSorted'] = isSorted;
  window['wait'] = wait;
  window['move'];

  let raf: number;

  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(stream);
    preview.srcObject = stream;
    const chunkCanvases = container.querySelectorAll('canvas');
    chunkCanvases.forEach((chunkCanvas) => {
      chunkCanvas.style.height = '128px';
      chunkCanvas.style.width = '128px';
      chunkCanvas.width = 128 * devicePixelRatio;
      chunkCanvas.height = 128 * devicePixelRatio;
      const ctx = chunkCanvas.getContext('2d')!;
      ctx.scale(devicePixelRatio, devicePixelRatio);
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
          if (showNumbers()) {
            chunkCtx.fillStyle = '#312e81aa';
            chunkCtx.fillRect(0, 0, 128, 128);
            chunkCtx.font = '30px Zed';
            chunkCtx.textAlign = 'center';
            chunkCtx.textBaseline = 'middle';
            chunkCtx.fillStyle = '#fff';
            chunkCtx.fillText(`${item}`, chunkRectSize.width / 2, chunkRectSize.height / 2);
          }
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
      <video muted autoplay ref={preview!} class="fixed h-0 w-0" />
      <canvas ref={canvas!} class="h-0 w-0" />
      <div class="grid w-fit grid-flow-dense grid-cols-4 gap-2" ref={container!}>
        <For each={items()}>
          {(item, i) => (
            <button
              disabled={item === blankTile || !validMovesByIndex().includes(i())}
              class="bg-videocamera relative h-32 w-32 cursor-pointer disabled:cursor-default"
              classList={{
                'outline-8 outline-indigo-500': validMovesByIndex().includes(i()),
                'opacity-0': item === blankTile,
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
      <div class="flex gap-2">
        <Button
          onClick={() => {
            setShowNumbers((prev) => !prev);
          }}
        >
          <Show when={showNumbers()} fallback="show guides">
            hide guides
          </Show>
        </Button>
        <Button
          onClick={() => {
            setItems(inputTiles.map(([i]) => i));
          }}
        >
          restart
        </Button>
      </div>
    </>
  );
}

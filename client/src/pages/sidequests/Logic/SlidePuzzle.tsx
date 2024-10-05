import { onCleanup, onMount } from 'solid-js';
import { createSignal, For } from 'solid-js';

declare global {
  interface Document {
    startViewTransition(updateCallback: () => Promise<void> | void): void;
  }
}

function shuffle(array: number[]) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j]!, clone[i]!];
  }
  return clone;
}

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
  let preview: HTMLVideoElement;
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  const [items, setItems] = createSignal(shuffle(Array.from({ length: 16 }, (_, i) => i)));
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
  const validMoves = () => findValidMoves(items(), items().indexOf(slotItem));

  let raf: number;

  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
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

          chunkCtx.font = '40px sans-serif';
        }
      }
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);
  });

  onCleanup(() => {
    cancelAnimationFrame(raf);
  });

  return (
    <>
      <video muted autoplay ref={preview!} class="t-0 l-0 fixed h-0 w-0" />
      <canvas ref={canvas!} class="h-0 w-0" />
      <div class="grid w-fit grid-flow-dense grid-cols-4 gap-2" ref={container!}>
        <For each={items()}>
          {(item, i) => (
            <button
              disabled={item === slotItem}
              class="bg-videocamera relative h-32 w-32 cursor-pointer disabled:cursor-default"
              classList={{
                'outline-8 outline-indigo-500': validMoves().includes(i()),
                'opacity-0': item === slotItem,
              }}
              style={{
                'view-transition-name': `slidepuzzle-${item}`,
              }}
              onClick={() => {
                const itemAttemptingToMove = items().indexOf(item);
                if (!validMoves().includes(itemAttemptingToMove)) {
                  return;
                }
                const prev = items();
                const newItems = [...prev];
                newItems[prev.indexOf(item)] = slotItem;
                newItems[prev.indexOf(slotItem)] = item;
                updateBoard(newItems);
                // if (newItems is sorted) {
                //   send result to server
                // }
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

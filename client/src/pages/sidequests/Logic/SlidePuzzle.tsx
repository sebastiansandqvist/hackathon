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

function getCoords(index: number) {
  const x = index % 4;
  const y = Math.floor(index / 4);
  return { x, y };
}

function findValidMoves(board: number[], slotIndex: number) {
  const possibilities = [slotIndex - 1, slotIndex + 1, slotIndex - 4, slotIndex + 4];
  const validMoves = possibilities.filter((index) => {
    return index >= 0 && index < board.length;
  });
  return validMoves;
}

export function SlidePuzzle() {
  const [items, setItems] = createSignal(shuffle(Array.from({ length: 16 }, (_, i) => i + 1)));
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
  return (
    <div class="grid w-fit grid-flow-dense grid-cols-4 gap-1">
      <For each={items()}>
        {(item, i) => (
          <button
            disabled={item === slotItem}
            class="h-32 w-32 cursor-pointer disabled:cursor-default"
            classList={{
              'bg-red-950': validMoves().includes(i()),
              'bg-blue-950': !validMoves().includes(i()),
              'opacity-50': item === slotItem,
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
            }}
          >
            {item}
          </button>
        )}
      </For>
    </div>
  );
}

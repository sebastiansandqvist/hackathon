import { type Component, createSignal, For } from 'solid-js';
import { useAutoAnimate } from 'solid-auto-animate';

export const Sortable: Component<{
  items: { id: string; text: string }[];
  onReorder: (ids: string[]) => void;
}> = (props) => {
  let parent: HTMLOListElement;
  const [items, setItems] = createSignal(props.items);
  const [draggedId, setDraggedId] = createSignal<string | null>(null);

  useAutoAnimate(() => parent!, { disrespectUserMotionPreference: true });

  return (
    <ol class="grid gap-2 text-indigo-100" ref={parent!}>
      <For each={items()}>
        {(item, index) => (
          <li
            class="grid cursor-ns-resize grid-cols-[auto_1fr] items-center justify-between border border-indigo-500 py-2 px-3 text-sm"
            classList={{
              'border-dotted !border-indigo-500/50': draggedId() === item.id,
            }}
            draggable="true"
            onDragStart={(e) => {
              setDraggedId(item.id);
              if (!e.dataTransfer) return;
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
            }}
            onDragEnd={(e) => {
              setDraggedId(null);
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('!border-emerald-500');
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('!border-emerald-500');
              if (!e.dataTransfer) return;
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.currentTarget.classList.remove('!border-emerald-500');
              const dragSrcId = draggedId();
              if (dragSrcId && dragSrcId !== item.id) {
                const itemsCopy = [...items()];
                const fromIndex = itemsCopy.findIndex((i) => i.id === dragSrcId);
                const toIndex = itemsCopy.findIndex((i) => i.id === item.id);
                const [removedItem] = itemsCopy.splice(fromIndex, 1);
                itemsCopy.splice(toIndex, 0, removedItem!);
                setItems(itemsCopy);
              }
              setDraggedId(null);
              props.onReorder(items().map((item) => item.id));
            }}
          >
            <p class="overflow-hidden text-ellipsis whitespace-nowrap" title={item.text}>
              {item.text}
            </p>{' '}
            <p class="whitespace-nowrap text-right text-sm text-emerald-500">(+{items().length - index()})</p>
          </li>
        )}
      </For>
    </ol>
  );
};

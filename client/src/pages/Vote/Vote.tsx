import { createSignal, For, type Component } from 'solid-js';
import { useAutoAnimate } from 'solid-auto-animate';
import { Layout } from '../../components/Layout';

// TODO:
// show all projects except for those that the user participated in.
// drag and drop to move projects around in order from 1 to n?

// should there be multiple criteria to consider?
// - technical merit
// - user experience
// - creativity

// does the project exhibit a high degree of technical difficulty or complexity? was it executed in a way that demonstrates a high level of technical skill?
// how would you rate the experience of using this project? projects that are fun, useful, or polished will rank highly in this category.
// how would you rank the project's originality and aesthetics? does it demonstrate creative thinking and ingenuity?

const Sortable: Component<{ items: { id: string; text: string }[]; onReorder: (ids: string[]) => void }> = (props) => {
  let parent: HTMLOListElement;
  const [items, setItems] = createSignal(props.items);
  const [draggedId, setDraggedId] = createSignal<string | null>(null);

  useAutoAnimate(() => parent!, { disrespectUserMotionPreference: true });

  return (
    <ol class="grid gap-2" ref={parent!}>
      <For each={items()}>
        {(item) => (
          <li
            class="cursor-ns-resize border border-indigo-500 py-2 px-4"
            classList={{
              'border-dotted !border-indigo-500/50': draggedId() === item.id,
            }}
            draggable="true"
            onDragStart={(e) => {
              setDraggedId(item.id);
              if (!e.dataTransfer) return;
              e.dataTransfer.effectAllowed = 'move';
              const clone = document.createElement('li');
              clone.className = 'fixed -top-32 cursor-ns-resize border border-indigo-500 py-2 px-4 w-64';
              clone.textContent = item.text;
              document.body.appendChild(clone);
              e.dataTransfer.setDragImage(clone, 0, 0);
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
              if (dragSrcId !== item.id) {
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
            {item.text}
          </li>
        )}
      </For>
    </ol>
  );
};

export function Vote() {
  const sortableItems = [
    { id: '1', text: 'item 1' },
    { id: '2', text: 'item 2' },
    { id: '3', text: 'item 3' },
  ];
  return (
    <Layout>
      <Sortable items={sortableItems} onReorder={(ids) => console.log(ids)} />
    </Layout>
  );
}

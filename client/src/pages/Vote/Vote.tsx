import { createSignal, For, type Component } from 'solid-js';
import { useAutoAnimate } from 'solid-auto-animate';
import { Layout } from '../../components/Layout';
import { SectionHeading, Title, Uppercase } from '../../components/Text';

const Sortable: Component<{ items: { id: string; text: string }[]; onReorder: (ids: string[]) => void }> = (props) => {
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

function shuffle<T>(items: T[]) {
  const itemsCopy = [...items];
  for (let i = itemsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j]!, itemsCopy[i]!];
  }
  return itemsCopy;
}

export function Vote() {
  // TODO:
  // load the projects over trpc
  // clone 3 times, shuffling each one
  // assign each clone to a rubric criterion
  const sortableItems = [
    { id: '1', text: 'example project 1' },
    { id: '2', text: 'another project' },
    { id: '3', text: 'a third project has a long name' },
    { id: '4', text: 'project four' },
    { id: '5', text: 'five' },
  ];
  return (
    <Layout>
      <Title>Vote</Title>
      <header>
        <p class="mb-2">
          congrats on making it to the end! now, we vote. rank each project by the following three criteria: creativity,
          technical merit, and user experience. points <span class="text-sm text-emerald-500">(+2)</span> will be
          awarded for each criterion.
        </p>
        <dl class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <dt>
            <SectionHeading class="text-base">creativity</SectionHeading>
          </dt>
          <dd class="text-indigo-300/75">
            how would you rank the project's originality and aesthetics? does it demonstrate creative thinking and
            ingenuity?
          </dd>
          <dt>
            <SectionHeading class="text-base">technical merit</SectionHeading>
          </dt>
          <dd class="text-indigo-300/75">
            does the project exhibit technical difficulty or complexity? was it executed with a high degree of skill?
          </dd>
          <dt>
            <SectionHeading class="text-base">user experience</SectionHeading>
          </dt>
          <dd class="text-indigo-300/75">
            how would you rate the experience of using this project? if it looks fun, useful, or polished, it should
            rank highly here.
          </dd>
        </dl>
      </header>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section class="grid gap-2">
          <Uppercase>creativity</Uppercase>
          <Sortable items={sortableItems} onReorder={(ids) => console.log(ids)} />
        </section>
        <section class="grid gap-2">
          <Uppercase>technical merit</Uppercase>
          <Sortable items={sortableItems} onReorder={(ids) => console.log(ids)} />
        </section>
        <section class="grid gap-2">
          <Uppercase>user experience</Uppercase>
          <Sortable items={sortableItems} onReorder={(ids) => console.log(ids)} />
        </section>
      </div>

      <section>
        <Uppercase>projects you contributed to:</Uppercase>
        <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <li>(TODO)</li>
        </ul>
      </section>
    </Layout>
  );
}

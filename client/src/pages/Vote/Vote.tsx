import { Layout } from '../../components/Layout';
import { SectionHeading, Title, Uppercase } from '../../components/Text';
import { Sortable } from './components/Sortable';

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
        <p class="mb-2 text-indigo-100">
          congrats on making it to the end! now, we vote. rank each project by the following three criteria:{' '}
          <strong class="text-white">creativity</strong>, <strong class="text-white">technical merit</strong>, and{' '}
          <strong class="text-white">user experience</strong>. points <span class="text-sm text-emerald-500">(+2)</span>{' '}
          will be awarded for each criterion.
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

import { createSignal, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ButtonPrimary, flashMessage, Layout, SectionHeading, Title, Uppercase } from '~/components';
import { mutate, query, trpc } from '~/trpc';
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
  const navigate = useNavigate();
  const projects = query('loadProjectsForVoting', trpc.loadProjectsForVoting);
  const vote = mutate(trpc.submitOrUpdateVote, {
    onError(err) {
      alert(err.message ?? 'something went wrong');
    },
    async onSuccess() {
      await flashMessage('vote saved!');
      navigate('/');
    },
  });
  const [creativityVotes, setCreativityVotes] = createSignal<string[]>([]);
  const [technicalMeritVotes, setTechnicalMeritVotes] = createSignal<string[]>([]);
  const [userExperienceVotes, setUserExperienceVotes] = createSignal<string[]>([]);
  return (
    <Layout>
      <Title>Vote</Title>
      <header>
        <p class="mb-2 text-indigo-200">
          congrats on making it to the end! now, we vote. rank each project by the following three criteria:{' '}
          <strong class="text-white">creativity</strong>, <strong class="text-white">technical merit</strong>, and{' '}
          <strong class="text-white">user experience</strong>. between{' '}
          <span class="text-sm text-emerald-500">(+1)</span> and{' '}
          <span class="text-sm text-emerald-500">(+{projects.data?.projects.length ?? '...'})</span> points will be
          awarded in each of these three criteria:
        </p>
        <dl class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
          <dt>
            <SectionHeading class="text-base">creativity</SectionHeading>
          </dt>
          <dd class="text-indigo-200">
            how would you rank the project's originality and aesthetics? does it demonstrate creative thinking and
            ingenuity?
          </dd>
          <dt>
            <SectionHeading class="text-base">technical merit</SectionHeading>
          </dt>
          <dd class="text-indigo-200">
            does the project exhibit technical difficulty or complexity? was it executed with a high degree of skill?
          </dd>
          <dt>
            <SectionHeading class="text-base">user experience</SectionHeading>
          </dt>
          <dd class="text-indigo-200">
            how would you rate the experience of using this project? if it looks fun, useful, or polished, it should
            rank highly here.
          </dd>
        </dl>
      </header>
      <Show when={projects.data} keyed>
        {(data) => (
          <>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <section class="grid gap-2">
                <Uppercase>creativity</Uppercase>
                <Sortable items={shuffle(data.projects)} onReorder={setCreativityVotes} />
              </section>
              <section class="grid gap-2">
                <Uppercase>technical merit</Uppercase>
                <Sortable items={shuffle(data.projects)} onReorder={setTechnicalMeritVotes} />
              </section>
              <section class="grid gap-2">
                <Uppercase>user experience</Uppercase>
                <Sortable items={shuffle(data.projects)} onReorder={setUserExperienceVotes} />
              </section>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <div class="col-start-2 grid">
                <ButtonPrimary
                  disabled={vote.isPending}
                  onClick={() => {
                    vote.mutate({
                      creativity: creativityVotes(),
                      technicalMerit: technicalMeritVotes(),
                      experience: userExperienceVotes(),
                    });
                  }}
                >
                  Submit
                </ButtonPrimary>
              </div>
            </div>

            <section>
              <Uppercase>projects you contributed to:</Uppercase>
              <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
                <For each={data.yourProjects}>{(project) => <li>{project.name}</li>}</For>
              </ul>
            </section>
          </>
        )}
      </Show>
    </Layout>
  );
}

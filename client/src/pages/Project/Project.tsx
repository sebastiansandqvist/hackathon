import { For, Match, Show, Switch, type Component } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { Layout } from '../../components/Layout';
import { query, trpc, type RouterOutput } from '../../trpc';
import { ButtonPrimary } from '../../components/Button';
import { Markdown } from './components/Markdown';
import { Title } from '../../components/Text';

// TODO: link to repo url
// TODO: link to hosted url
// TODO: list contributors / creator

const ProjectContent: Component<RouterOutput['projectById']> = (props) => (
  <div class="grid gap-8">
    <header class="flex items-center gap-4 border-b pb-8">
      <Title>{props.name}</Title>
      <Show when={props.canEdit}>
        <A href="/submit">
          <ButtonPrimary>edit</ButtonPrimary>
        </A>
      </Show>
    </header>
    <div class="text-indigo-100">
      <Markdown source={() => props.description} />
    </div>
    <ul class="grid list-outside list-disc gap-4 py-4 px-10 text-indigo-100 marker:text-indigo-300/75">
      <For each={props.contributors}>
        {(contributor) => (
          <li>
            <code class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
              {contributor}
            </code>
          </li>
        )}
      </For>
    </ul>
  </div>
);

export function Project() {
  const id = useParams<{ id: string }>().id;
  const result = query('projectById', trpc.projectById, {
    input: () => ({ id }),
  });
  return (
    <Layout>
      <Switch>
        <Match when={result.data} keyed>
          {(project) => <ProjectContent {...project} />}
        </Match>
        <Match when={result.error} keyed>
          {(error) => <div>Error: {error.message ?? 'Unable to load project'}</div>}
        </Match>
      </Switch>
    </Layout>
  );
}

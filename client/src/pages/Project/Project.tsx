import { For, Match, Show, Switch, type Component } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { query, trpc, type RouterOutput } from '~/trpc';
import { ButtonPrimary, Layout, Title } from '~/components';
import { Markdown } from './components/Markdown';

const ProjectContent: Component<RouterOutput['projectById']> = (props) => (
  <div class="grid gap-8">
    <header class="grid gap-4 border-b border-indigo-300/50 pb-8">
      <div class="flex items-center gap-4">
        <Title>{props.name}</Title>
        <Show when={props.canEdit}>
          <A href="/submit">
            <ButtonPrimary>edit</ButtonPrimary>
          </A>
        </Show>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-indigo-300">a project by: </span>
        <div class="flex flex-wrap gap-2">
          <div class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
            {props.createdBy}
          </div>
          <For each={props.contributors}>
            {(contributor) => (
              <div class="whitespace-nowrap rounded border border-indigo-900 bg-indigo-950 py-0.5 px-1 text-sm">
                {contributor}
              </div>
            )}
          </For>
        </div>
      </div>
      <Show when={props.hostedUrl}>
        <div class="text-indigo-100">
          <span class="text-indigo-300">try it at: </span>
          <a href={props.hostedUrl} class="underline transition hover:text-white">
            {props.hostedUrl}
          </a>
        </div>
      </Show>
      <Show when={props.repoUrl}>
        <div class="text-indigo-100">
          <span class="text-indigo-300">view source: </span>
          <a href={props.repoUrl} class="underline transition hover:text-white">
            {props.repoUrl}
          </a>
        </div>
      </Show>
    </header>
    <div class="text-indigo-100">
      <Markdown source={() => props.description} />
    </div>
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

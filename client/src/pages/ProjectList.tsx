import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Layout } from '../components/Layout';
import { query, trpc } from '../trpc';
import { ButtonPrimary } from '../components/Button';
import { commaSeparatedList } from '../util';

export function ProjectList() {
  const projects = query('listProjects', trpc.listProjects);
  return (
    <Layout>
      <h1 class="font-pixel text-2xl">Projects</h1>
      <Show when={projects.data} keyed>
        {(data) => (
          <div class="grid gap-4 text-indigo-100">
            <For each={data}>
              {(project, i) => (
                <A
                  href={`/projects/${project.id}`}
                  class="grid grid-cols-[50px_1fr] bg-indigo-900/75 p-6 transition hover:bg-indigo-900"
                >
                  <div class="text-indigo-300/75">{i() + 1}.</div>
                  <div>
                    {project.name}

                    <div class="flex items-center gap-2">
                      <span class="text-indigo-300">a project by: </span>
                      <div>{commaSeparatedList([project.createdBy, ...project.contributors])}</div>
                    </div>
                  </div>
                </A>
              )}
            </For>
          </div>
        )}
      </Show>
      <footer class="border-t border-indigo-500/30 pt-8">
        <A href="/">
          <ButtonPrimary>
            <span class="font-dot not-italic">&lt;</span> home
          </ButtonPrimary>
        </A>
      </footer>
    </Layout>
  );
}

import { Show, For, createSignal } from 'solid-js';
import { Layout } from '../../components/Layout';
import { SectionHeading, Title } from '../../components/Text';
import { mutate, query, trpc } from '../../trpc';
import { Input, TextArea } from '../../components/Input';
import { ButtonPrimary } from '../../components/Button';

const projectDescriptionPlaceholder = `# overview

![screenshot](https://example.com/screenshot.png)

this project is...

# technology used

- languages
- libraries
- etc.

# contributor roles

...`;

// TODO: load the project from the db if there is one already, and prepopulate the form fields
// TODO: do something on success. redirect to a project page?
export function SubmitProject() {
  const possibleContributors = query('possibleContributors', trpc.possibleContributors);
  const [projectName, setProjectName] = createSignal('');
  const [contributors, setContributors] = createSignal<string[]>([]);
  const [repoUrl, setRepoUrl] = createSignal('');
  const [hostedUrl, setHostedUrl] = createSignal('');
  const [description, setDescription] = createSignal('');
  const submit = mutate(trpc.submitOrUpdateProject, {});
  return (
    <Layout>
      <Title>Submit Project</Title>
      <form
        class="grid gap-12"
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate({
            name: projectName(),
            description: description(),
            contributors: contributors(),
            repoUrl: repoUrl(),
            hostedUrl: hostedUrl(),
          });
        }}
      >
        <label>
          <SectionHeading class="text-base">project name</SectionHeading>
          <Input
            required
            type="text"
            maxLength={20}
            class="w-96 max-w-full"
            value={projectName()}
            onInput={(e) => setProjectName(e.currentTarget.value)}
          />
        </label>
        <label>
          <SectionHeading class="text-base">repo url</SectionHeading>
          <Input
            required
            type="url"
            placeholder="eg. https://github.com/you/project"
            maxLength={256}
            class="w-96 max-w-full"
            value={repoUrl()}
            onInput={(e) => setRepoUrl(e.currentTarget.value)}
          />
        </label>
        <label>
          <SectionHeading class="text-base">hosted url (optional)</SectionHeading>
          <Input
            type="url"
            placeholder="eg. https://example.itch.io/project"
            maxLength={256}
            class="w-96 max-w-full"
            value={hostedUrl()}
            onInput={(e) => setHostedUrl(e.currentTarget.value)}
          />
        </label>
        <div class="grid gap-2">
          <SectionHeading class="text-base">contributors</SectionHeading>
          <Show when={possibleContributors.data} fallback="loading..." keyed>
            {(data) => (
              <>
                <label class="flex items-center gap-3 select-none">
                  <input class="h-4 w-4 accent-indigo-500" type="checkbox" disabled checked />
                  <span class="text-indigo-200">{data.you}</span>
                </label>

                <For each={data.others}>
                  {(contributor) => (
                    <label class="flex items-center gap-3 select-none">
                      <input
                        class="h-4 w-4 accent-indigo-500"
                        type="checkbox"
                        onInput={(e) =>
                          setContributors((prev) =>
                            prev.includes(contributor.id)
                              ? prev.filter((id) => id !== contributor.id)
                              : [...prev, contributor.id],
                          )
                        }
                        checked={contributors().includes(contributor.id)}
                      />
                      <span class="text-indigo-200">{contributor.username}</span>
                    </label>
                  )}
                </For>
              </>
            )}
          </Show>
        </div>
        <label>
          <SectionHeading class="text-base">project description (markdown)</SectionHeading>
          <TextArea
            placeholder={projectDescriptionPlaceholder}
            maxLength={2048}
            class="w-96 max-w-full"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
          />
        </label>
        <div class="grid sm:grid-cols-3">
          <ButtonPrimary type="submit" disabled={submit.isPending}>
            Submit{/* should say "Save" if there was already a project */}
          </ButtonPrimary>
        </div>
      </form>
    </Layout>
  );
}

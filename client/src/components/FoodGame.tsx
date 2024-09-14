import { createSignal, For, Show, type Component } from 'solid-js';
import { createAutofocus } from '@solid-primitives/autofocus';
import { invalidate, mutate, trpc } from '../trpc';
import { Button, ButtonPrimary } from './Button';
import { Input } from './Input';
import { TvOnly } from './Auth';

function NewFoodGameButton() {
  const update = mutate(trpc.updateFoodGame, {
    onSettled() {
      invalidate('homepage');
    },
  });

  return (
    <TvOnly>
      <ButtonPrimary
        disabled={update.isPending}
        onClick={() => {
          const title = prompt('title');
          const firstItem = prompt('first item');
          if (!title || !firstItem) return;
          update.mutate({ title, items: [firstItem] });
        }}
      >
        New vote
      </ButtonPrimary>
    </TvOnly>
  );
}

export const FoodGame: Component<{ title: string; items: string[] }> = (props) => {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement>();
  createAutofocus(inputElement);

  const [newItem, setNewItem] = createSignal('');
  const update = mutate(trpc.updateFoodGame, {
    onSettled() {
      invalidate('homepage');
    },
    onError(err: Error) {
      alert(err.message ?? 'Unable to update food game');
    },
  });

  return (
    <Show when={props.items.length > 0} fallback={<NewFoodGameButton />}>
      <div class="grid gap-2">
        <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">{props.title}</h3>
        <For each={props.items}>
          {(item, i) => (
            <div class="flex items-center gap-2">
              <span class="text-indigo-200">{item}</span>
              <TvOnly>
                <Button
                  disabled={update.isPending}
                  onClick={() => {
                    update.mutate({
                      title: props.title,
                      items: [...props.items.slice(0, i()), ...props.items.slice(i() + 1)],
                    });
                  }}
                >
                  <span class="not-italic">❌</span>
                </Button>
              </TvOnly>
            </div>
          )}
        </For>
        <TvOnly>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await update.mutateAsync({ title: props.title, items: [...props.items, newItem()] });
              setNewItem('');
            }}
          >
            <Input
              type="text"
              autofocus
              ref={setInputElement}
              disabled={update.isPending}
              value={newItem()}
              onInput={(e) => setNewItem(e.currentTarget.value)}
            />
            <ButtonPrimary type="submit" disabled={update.isPending}>
              <span class="not-italic">+</span>
            </ButtonPrimary>
          </form>
        </TvOnly>
      </div>
    </Show>
  );
};

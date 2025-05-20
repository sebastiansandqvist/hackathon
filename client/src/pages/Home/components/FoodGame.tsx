import { createSignal, For, Show, type Component } from 'solid-js';
import { invalidate, mutate, trpc } from '~/trpc';
import { Button, ButtonPrimary, Input, Uppercase } from '~/components';

function NewFoodGameButton() {
  const update = mutate(trpc.updateFoodGame, {
    onSettled() {
      invalidate('homepage');
    },
  });

  return (
    <ButtonPrimary
      disabled={update.isPending}
      onClick={() => {
        const title = prompt('title');
        const firstItem = prompt('first item');
        if (!title || !firstItem) return;
        update.mutate({ title, items: [firstItem] });
      }}
    >
      new vote
    </ButtonPrimary>
  );
}

export const FoodGame: Component<{ title: string; items: string[]; tv?: boolean }> = (props) => {
  const [inputElement, setInputElement] = createSignal<HTMLInputElement>();
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
    <Show
      when={props.items.length > 0}
      fallback={
        <Show when={props.tv}>
          <NewFoodGameButton />
        </Show>
      }
    >
      <div class="grid gap-2">
        <h3 class="mt-2 uppercase tracking-widest text-indigo-300/75">{props.title}</h3>
        <Show when={props.items.length === 1}>
          <span class="text-indigo-300/75">the vote is in. we're ordering...</span>
        </Show>
        <For each={props.items}>
          {(item, i) => (
            <div class="flex items-center gap-2">
              <span class="text-indigo-200">{item}</span>
              <Show when={props.tv}>
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
              </Show>
            </div>
          )}
        </For>
        <Show when={props.tv}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await update.mutateAsync({ title: props.title, items: [...props.items, newItem()] });
              setNewItem('');
              inputElement()?.focus();
            }}
          >
            <Input
              type="text"
              ref={setInputElement}
              disabled={update.isPending}
              value={newItem()}
              onInput={(e) => setNewItem(e.currentTarget.value)}
            />
            <ButtonPrimary type="submit" disabled={update.isPending}>
              <span class="not-italic">+</span>
            </ButtonPrimary>
          </form>
        </Show>
      </div>
    </Show>
  );
};

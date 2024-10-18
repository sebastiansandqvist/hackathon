import { type Component, createEffect, createSignal, on } from 'solid-js';
import { mutate, trpc, invalidate } from '~/trpc';
import { ButtonPrimary } from './Button';
import { flashMessage } from './FlashMessage';
import { Input } from './Input';

export const SuggestTheme: Component<{ initialThemeSuggestion: string }> = (props) => {
  console.log('suggestTheme', props.initialThemeSuggestion);
  const [themeSuggestion, setThemeSuggestion] = createSignal('');
  const suggestTheme = mutate(trpc.suggestTheme, {
    onSuccess() {
      flashMessage('saved!');
      invalidate('status');
      invalidate('homepage');
    },
  });

  createEffect(() => {
    setThemeSuggestion(props.initialThemeSuggestion);
  });

  return (
    <form
      class="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        suggestTheme.mutate({ theme: themeSuggestion() });
      }}
    >
      <Input
        type="text"
        placeholder="your suggestion..."
        value={themeSuggestion()}
        onInput={(e) => setThemeSuggestion(e.currentTarget.value)}
      />
      <ButtonPrimary
        type="submit"
        disabled={
          suggestTheme.isPending || themeSuggestion() === '' || themeSuggestion() === props.initialThemeSuggestion
        }
      >
        save
      </ButtonPrimary>
    </form>
  );
};

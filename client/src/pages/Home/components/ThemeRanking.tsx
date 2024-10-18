import { type Component } from 'solid-js';
import { Sortable } from '~/components';
import { invalidate, mutate, trpc } from '~/trpc';

export const ThemeRanking: Component<{
  themes: string[];
  ownSuggestion: string;
}> = (props) => {
  const setRankings = mutate(trpc.rankThemes, {
    onError(err) {
      alert(err.message ?? 'Unable to update rankings');
    },
    onSettled() {
      invalidate('status');
      invalidate('homepage');
    },
  });
  return (
    <div class="grid gap-2">
      <Sortable
        items={props.themes.map((theme) => ({ id: theme, name: theme }))}
        onReorder={(updatedRankings) => {
          setRankings.mutate({
            themes: updatedRankings,
          });
        }}
      />
    </div>
  );
};

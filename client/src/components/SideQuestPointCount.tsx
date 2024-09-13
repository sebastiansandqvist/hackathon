import { Switch, Match } from 'solid-js';
import { Authenticated } from './Auth';

export function SideQuestPointCount({ quest }: { quest: 'hacking' | 'logic' | 'algorithms' | 'puzzles' }) {
  return (
    <Authenticated>
      {({ sideQuests }) => (
        <Switch>
          <Match when={sideQuests[quest].hard}>
            <span class="text-sm text-emerald-500"> (+3) COMPLETE</span>
          </Match>
          <Match when={sideQuests[quest].easy}>
            <span class="text-sm text-emerald-500"> (+1)</span>
          </Match>
        </Switch>
      )}
    </Authenticated>
  );
}

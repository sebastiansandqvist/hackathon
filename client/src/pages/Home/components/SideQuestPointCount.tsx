import { Switch, Match } from 'solid-js';
import { Authenticated } from '~/components';

export function SideQuestPointCount({
  quest,
}: {
  quest: 'hacking' | 'logic' | 'algorithms' | 'graphics' | 'puzzles' | 'forensics';
}) {
  return (
    <Authenticated>
      {({ sideQuests }) => (
        <Switch>
          <Match when={sideQuests[quest]?.hard}>
            <span class="text-sm text-emerald-500">
              {' '}
              (+3 points) <strong>COMPLETE</strong>
            </span>
          </Match>
          <Match when={sideQuests[quest]?.easy}>
            <span class="text-sm text-sky-400"> (+1 point)</span>
          </Match>
        </Switch>
      )}
    </Authenticated>
  );
}

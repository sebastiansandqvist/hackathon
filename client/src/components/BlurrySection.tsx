import type { ParentComponent } from 'solid-js';
import { query, trpc, mutate, invalidate } from '../trpc';

export const BlurrySection: ParentComponent<{ section: string }> = (props) => {
  const home = query('homepage', trpc.homepage); // TODO: make this a subscription
  const reveal = mutate(trpc.revealHomepageSection, {
    onSuccess() {
      invalidate('homepage');
    },
  });

  return (
    <section
      class="transition-all duration-500"
      classList={{
        blur: !home.data?.visibleSections.includes(props.section),
      }}
      onClick={() => {
        if (!home.data?.visibleSections.includes(props.section)) {
          reveal.mutate({ section: props.section });
        }
      }}
    >
      {props.children}
    </section>
  );
};

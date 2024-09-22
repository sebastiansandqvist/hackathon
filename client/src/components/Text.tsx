import type { ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export const Title: ParentComponent<{ class?: string }> = (props) => {
  return (
    <h1
      class="font-quill text-6xl sm:text-7xl md:text-8xl"
      classList={{
        [props.class ?? '']: true,
      }}
    >
      {props.children}
    </h1>
  );
};

export const SectionHeading: ParentComponent<{ class?: string; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' }> = (
  props,
) => (
  <Dynamic
    component={props.as ?? 'h2'}
    class="font-pixel flex items-center text-2xl leading-loose"
    classList={{ [props.class ?? '']: true }}
  >
    {props.children}
  </Dynamic>
);

export const Uppercase: ParentComponent<{ class?: string; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' }> = (
  props,
) => (
  <Dynamic
    component={props.as ?? 'h2'}
    class="mt-2 uppercase tracking-widest text-indigo-300/75"
    classList={{ [props.class ?? '']: true }}
  >
    {props.children}
  </Dynamic>
);

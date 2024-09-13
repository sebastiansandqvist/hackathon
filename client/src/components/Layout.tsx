import type { ParentComponent } from 'solid-js';
import { Dots } from './Dots';

export const Layout: ParentComponent = (props) => (
  <Dots>
    <main class="mx-auto flex min-h-full max-w-4xl flex-col gap-12 p-12">{props.children}</main>
  </Dots>
);

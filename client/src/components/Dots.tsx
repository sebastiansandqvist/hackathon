import type { ParentComponent } from 'solid-js';

export const Dots: ParentComponent = (props) => {
  return (
    <div class="bg-dots stack min-h-full">
      <div class="pointer-events-none flex w-full items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div class="z-10 w-screen">{props.children}</div>
    </div>
  );
};

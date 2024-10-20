import type { ParentComponent } from 'solid-js';

export const Dots: ParentComponent = (props) => {
  return (
    <div class="bg-dots stack min-h-full">
      <div class="pointer-events-none flex w-full items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div class="z-10 w-screen">{props.children}</div>
    </div>
  );
};

export const InnerLayout: ParentComponent = (props) => (
  <main class="mx-auto flex min-h-full max-w-4xl flex-col gap-12 px-12">{props.children}</main>
);

export const Layout: ParentComponent = (props) => (
  <Dots>
    <main class="mx-auto flex min-h-full max-w-4xl flex-col gap-12 p-6 sm:p-12">{props.children}</main>
  </Dots>
);

export const HomepageLayout: ParentComponent = (props) => (
  <Dots>
    <main class="mx-auto flex min-h-full max-w-[1400px] flex-col gap-12 p-6 sm:p-12">{props.children}</main>
  </Dots>
);

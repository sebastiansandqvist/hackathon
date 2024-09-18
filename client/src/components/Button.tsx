import type { Component, JSX } from 'solid-js';
import { CanvasGridBg } from './CanvasGridBg';

export const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button
    {...props}
    class="h-fit cursor-pointer whitespace-nowrap border border-indigo-500/30 py-0.5 px-2 font-bold italic text-indigo-300 transition hover:bg-indigo-800/75 hover:text-white"
  >
    {props.children}
  </button>
);

export const ButtonSecondary: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button
    {...props}
    class="h-fit cursor-pointer whitespace-nowrap border border-indigo-500/50 bg-indigo-800/50 py-0.5 px-2 font-bold italic text-white transition hover:border-indigo-500 hover:bg-indigo-800/75"
  >
    {props.children}
  </button>
);

export const ButtonPrimary: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button
    {...props}
    class="h-fit cursor-pointer whitespace-nowrap border border-indigo-500/50 bg-indigo-700/50 font-bold italic text-white transition hover:border-indigo-500"
  >
    <CanvasGridBg>
      <div class="py-0.5 px-2">{props.children}</div>
    </CanvasGridBg>
  </button>
);

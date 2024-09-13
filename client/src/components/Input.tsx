import type { Component, JSX } from 'solid-js';

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    class="border-0 border-b border-dotted border-indigo-500 py-0.5 italic outline-none transition placeholder:text-indigo-400/75 focus:border-solid"
  >
    {props.children}
  </input>
);

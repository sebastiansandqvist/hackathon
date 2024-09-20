import { createEffect, createSignal, For, type Component, type JSX } from 'solid-js';

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    class="border-0 border-b border-dotted border-indigo-500 py-0.5 italic outline-none transition placeholder:text-indigo-400/60 focus:border-solid"
    classList={{ [props.class ?? '']: true }}
  />
);

export const TextArea: Component<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const [textarea, setTextarea] = createSignal<HTMLTextAreaElement>();

  createEffect(() => {
    const el = textarea();
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 4}px`;
  });

  return (
    <textarea
      {...props}
      ref={setTextarea}
      onInput={(e) => {
        // e.currentTarget.style.height = 'auto';
        // e.currentTarget.style.height = `${e.currentTarget.scrollHeight + 4}px`;
        if (typeof props.onInput !== 'function') return;
        props.onInput(e);
      }}
      class="w-full resize-y border-0 border-b border-dotted border-indigo-500 py-1 italic outline-none transition placeholder:text-indigo-400/60 focus:border-solid focus:bg-indigo-950/50"
      classList={{
        [props.class ?? '']: true,
      }}
    />
  );
};

export const MultiCharInput: Component<{ chars: number; onInput: (value: string) => void }> = (props) => {
  const inputs = Array.from({ length: props.chars }, () => {
    const [value, setValue] = createSignal('');
    const [element, setElement] = createSignal<HTMLInputElement>();
    return { value, setValue, element, setElement };
  });
  const aggregateValue = () => inputs.map((input) => input.value()).join('');
  return (
    <fieldset class="flex gap-1">
      <For each={inputs}>
        {(input, i) => (
          <input
            ref={input.setElement}
            value={input.value()}
            maxLength={1}
            onPaste={(e) => {
              const pastedText = e.clipboardData?.getData('text/plain');
              if (!pastedText) return;
              for (let j = 0; j < pastedText.length; j++) {
                inputs[i() + j]?.setValue(pastedText[j]!);
              }
              props.onInput(aggregateValue());
              const lastElement = Math.min(i() + pastedText.length, inputs.length - 1);
              inputs[lastElement]?.element()?.focus();
              e.preventDefault();
            }}
            onKeyUp={(e) => {
              if (e.key === 'Backspace') {
                if (input.value() === '') {
                  inputs[i() - 1]?.element()?.focus();
                  inputs[i() - 1]?.setValue('');
                  return;
                }
                input.setValue('');
                props.onInput(aggregateValue());
                return;
              }
              if (e.key === 'ArrowLeft') {
                inputs[i() - 1]?.element()?.focus();
                return;
              }
              if (e.key === 'ArrowRight') {
                inputs[i() + 1]?.element()?.focus();
                return;
              }
              const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789-.';
              const value = e.key.toLowerCase();
              if (!alphabet.includes(value)) return;
              input.setValue(value);
              props.onInput(aggregateValue());
              const direction = value ? 1 : -1;
              inputs[i() + direction]?.element()?.focus();
            }}
            type="text"
            class="w-[2ch] border-0 border-b border-dotted border-indigo-500 py-0.5 text-center italic outline-none transition placeholder:text-indigo-400/75 focus:border-solid"
          />
        )}
      </For>
    </fieldset>
  );
};

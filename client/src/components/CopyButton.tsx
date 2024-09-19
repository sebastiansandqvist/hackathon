import { writeClipboard } from '@solid-primitives/clipboard';
import { ButtonSecondary } from './Button';
import { createSignal, onCleanup, Show, type Component } from 'solid-js';
import { flashMessage } from './FlashMessage';

export const CopyButton: Component<{ input: () => string }> = (props) => {
  const [didCopy, setDidCopy] = createSignal(false);
  let timeoutId: ReturnType<typeof setTimeout>;

  onCleanup(() => clearTimeout(timeoutId));

  return (
    <ButtonSecondary
      disabled={didCopy()}
      onClick={() => {
        flashMessage('copied!');
        setDidCopy(true);
        writeClipboard(props.input());
        timeoutId = setTimeout(() => setDidCopy(false), 1000);
      }}
    >
      copy
    </ButtonSecondary>
  );
};

import { type Component, createSignal, onCleanup } from 'solid-js';
import { shuffle, wait } from '~/util';

function randomGlitchChar() {
  const possibilites =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?~`-=[];',./".split('');
  return possibilites[Math.floor(Math.random() * possibilites.length)] || 'A';
}

export const Glitch: Component<{ children: string; loopFrequency?: number }> = (props) => {
  const [glitchText, setGlitchText] = createSignal(props.children);

  const loopFrequency = props.loopFrequency ?? 2000;
  const loopDuration = 1000;
  const glitchFrequency = 100;

  const interval = setInterval(async () => {
    // slightly randomize, randomly, to avoid synchronization
    if (Math.random() > 0.5) {
      await wait((Math.random() * loopFrequency) / 2);
    } else {
      await wait((Math.random() * loopFrequency) / 5);
    }

    // pick a random non-space/punctuation character to glitch
    const punctuation = ' –.,';
    const glitchCharIndex = shuffle(props.children.split('').map((char, i) => ({ char, i }))).find(
      ({ char }) => !punctuation.includes(char),
    )?.i;

    if (glitchCharIndex === undefined) return;

    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      await wait(glitchFrequency);
      const newText = glitchText().split('');
      newText[glitchCharIndex] = randomGlitchChar();
      setGlitchText(newText.join(''));
    }

    await wait(loopDuration - glitchFrequency * iterations);
    setGlitchText(props.children);
  }, loopFrequency);

  onCleanup(() => {
    clearInterval(interval);
  });

  return <span>{glitchText()}</span>;
};

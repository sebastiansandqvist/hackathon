import { createQuery } from '@tanstack/solid-query';
import { type Component, createSignal } from 'solid-js';
import { randomInRange, shuffle, shuffleInPlace, wait } from '~/util';

let glitchI = 0;
let glitchChars = shuffle(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?~`-=[];',./".split(''),
);

function randomGlitchChar() {
  if (glitchI >= glitchChars.length) {
    shuffleInPlace(glitchChars);
    glitchI = 0;
  }
  return glitchChars[glitchI++]!;
}

export const Glitch: Component<{ children: string; loopFrequency?: number }> = (props) => {
  const [glitchText, setGlitchText] = createSignal(props.children);

  // this value is not actually the loop frequency due to randomization,
  // but it is the basis for the frequency of the glitch effect
  const loopFrequency = props.loopFrequency ?? 2000;

  const glitchify = async () => {
    // slightly randomize, randomly, to avoid synchronization
    if (Math.random() > 0.5) {
      await wait((Math.random() * loopFrequency) / 8);
    } else {
      await wait((Math.random() * loopFrequency) / 5);
    }

    // pick a random non-space/punctuation character to glitch
    const punctuation = ' –.,';
    const glitchCharIndex = shuffle(props.children.split('').map((char, i) => ({ char, i }))).find(
      ({ char }) => !punctuation.includes(char),
    )?.i;

    if (glitchCharIndex === undefined) return;

    const glitchFrequency = 100;
    const iterations = randomInRange(5, 15);
    for (let i = 0; i < iterations; i++) {
      await wait(glitchFrequency);
      const newText = glitchText().split('');
      newText[glitchCharIndex] = randomGlitchChar();
      setGlitchText(newText.join(''));
    }

    setGlitchText(props.children);
    return glitchText();
  };

  createQuery(() => ({
    queryKey: ['glitch', props.children],
    queryFn: glitchify,
    refetchInterval: loopFrequency,
  }));

  return <span class="will-change-contents">{glitchText()}</span>;
};

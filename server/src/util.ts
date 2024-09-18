export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function pickRandom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// from https://github.com/ai/nanoid/blob/main/non-secure/index.js
export const nanoid = (size = 21) => {
  // const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  const urlAlphabet = 'useandm26T9834PX75pxJACKVERYMNDBUSHWLFGQZbfghjkqvwyzrict'; // removed o/0/l/1/I/-/_
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * urlAlphabet.length) | 0];
  }
  return id;
};

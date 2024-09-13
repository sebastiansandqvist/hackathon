export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function pickRandom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

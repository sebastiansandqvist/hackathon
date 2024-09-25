export function commaSeparatedList(input: string[]) {
  const list = input.slice();
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  const last = list.pop();
  list.push(`and ${last}`);
  return list.join(', ');
}

// shuffle that mutates the array
export function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

export function shuffle<T>(items: T[]) {
  return shuffleInPlace([...items]);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

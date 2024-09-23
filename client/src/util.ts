export function commaSeparatedList(input: string[]) {
  const list = input.slice();
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  const last = list.pop();
  list.push(`and ${last}`);
  return list.join(', ');
}

export function shuffle<T>(items: T[]) {
  const itemsCopy = [...items];
  for (let i = itemsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j]!, itemsCopy[i]!];
  }
  return itemsCopy;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

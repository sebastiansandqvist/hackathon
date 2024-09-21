export function commaSeparatedList(input: string[]) {
  const list = input.slice();
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  const last = list.pop();
  list.push(`and ${last}`);
  return list.join(', ');
}

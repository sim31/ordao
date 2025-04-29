export function shortenId(id: string, bytes: number = 3): string {
  const length = bytes * 2 + 2;
  return id.slice(0, length) + '...';
}
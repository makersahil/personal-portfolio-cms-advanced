export function parseSort(sort, allowed = []) {
  if (!sort) return [{ createdAt: 'desc' }];
  const items = String(sort)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const orderBy = [];
  for (const item of items) {
    const desc = item.startsWith('-');
    const key = desc ? item.slice(1) : item;
    if (!allowed.includes(key)) continue;
    orderBy.push({ [key]: desc ? 'desc' : 'asc' });
  }
  return orderBy.length ? orderBy : [{ createdAt: 'desc' }];
}

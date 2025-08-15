export function buildLegacyAuthors(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  return list
    .map((a) => `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim())
    .filter(Boolean)
    .join('; ');
}

export function buildLegacyInventors(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  return list
    .map((i) => `${i.firstName ?? ''} ${i.lastName ?? ''}`.trim())
    .filter(Boolean)
    .join('; ');
}

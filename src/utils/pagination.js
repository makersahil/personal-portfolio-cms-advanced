export function makePagination(page, pageSize) {
  const p = Math.max(1, Number(page || 1));
  const s = Math.min(100, Math.max(1, Number(pageSize || 20)));
  return { skip: (p - 1) * s, take: s, page: p, pageSize: s };
}

export function buildMeta(page, pageSize, total) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return { page, pageSize, total, pages };
}

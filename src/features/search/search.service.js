import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

const ALL_KINDS = ['article', 'publication', 'grant', 'patent', 'certification'];

function pickSortFields(sort) {
  // allow only these common fields across kinds
  return parseSort(sort, ['year', 'title,', 'createdAt']);
}

function shape(kind, row) {
  // Normalize to a common DTO
  const base = {
    kind,
    id: row.id,
    slug: row.slug,
    title: row.title,
    year: row.year ?? null,
    createdAt: row.createdAt,
  };
  switch (kind) {
    case 'article':
      return { ...base, extra: { journal: row.journal, tags: row.tags ?? [] } };
    case 'publication':
      return {
        ...base,
        extra: { type: row.type, publisher: row.publisher ?? null, tags: row.tags ?? [] },
      };
    case 'grant':
      return { ...base, extra: { amount: row.amount ?? null } };
    case 'patent':
      return { ...base, extra: { country: row.country, patentNo: row.patentNo } };
    case 'certification':
      return { ...base, extra: { issuer: row.issuer } };
    default:
      return base;
  }
}

export async function unifiedSearch(query) {
  const { q, kind, type, year, tag, page, pageSize, sort } = query;
  const { page: p, pageSize: s } = makePagination(page, pageSize);
  const offset = (p - 1) * s;
  const kinds = kind ? [kind] : ALL_KINDS;

  // shared orderBy
  const orderBy = pickSortFields(sort);
  // to slice globally after merge, pull at least offset + s from each kind (upper bound 200)
  const takePerKind = Math.min(200, offset + s);

  const promises = kinds.map((k) => {
    switch (k) {
      case 'article': {
        const where = {
          published: true,
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { abstract: { contains: q, mode: 'insensitive' } },
                    { journal: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : undefined,
            typeof year === 'number' ? { year } : undefined,
            tag ? { tags: { has: tag } } : undefined,
          ].filter(Boolean),
        };
        return Promise.all([
          prisma.article.count({ where }),
          prisma.article
            .findMany({
              where,
              orderBy,
              take: takePerKind,
              select: {
                id: true,
                slug: true,
                title: true,
                journal: true,
                year: true,
                tags: true,
                createdAt: true,
              },
            })
            .then((rows) => rows.map((r) => shape('article', r))),
        ]);
      }
      case 'publication': {
        const where = {
          published: true,
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    { publisher: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : undefined,
            type ? { type } : undefined,
            typeof year === 'number' ? { year } : undefined,
            tag ? { tags: { has: tag } } : undefined,
          ].filter(Boolean),
        };
        return Promise.all([
          prisma.publication.count({ where }),
          prisma.publication
            .findMany({
              where,
              orderBy,
              take: takePerKind,
              select: {
                id: true,
                slug: true,
                title: true,
                type: true,
                publisher: true,
                year: true,
                tags: true,
                createdAt: true,
              },
            })
            .then((rows) => rows.map((r) => shape('publication', r))),
        ]);
      }
      case 'grant': {
        const where = {
          published: true,
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { summary: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : undefined,
            typeof year === 'number' ? { year } : undefined,
          ].filter(Boolean),
        };
        return Promise.all([
          prisma.researchGrant.count({ where }),
          prisma.researchGrant
            .findMany({
              where,
              orderBy,
              take: takePerKind,
              select: {
                id: true,
                slug: true,
                title: true,
                year: true,
                amount: true,
                createdAt: true,
              },
            })
            .then((rows) => rows.map((r) => shape('grant', r))),
        ]);
      }
      case 'patent': {
        const where = {
          published: true,
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { country: { contains: q, mode: 'insensitive' } },
                    { patentNo: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : undefined,
            typeof year === 'number' ? { year } : undefined,
          ].filter(Boolean),
        };
        return Promise.all([
          prisma.patent.count({ where }),
          prisma.patent
            .findMany({
              where,
              orderBy,
              take: takePerKind,
              select: {
                id: true,
                slug: true,
                title: true,
                country: true,
                patentNo: true,
                year: true,
                createdAt: true,
              },
            })
            .then((rows) => rows.map((r) => shape('patent', r))),
        ]);
      }
      case 'certification': {
        const where = {
          published: true,
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { issuer: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : undefined,
            typeof year === 'number' ? { year } : undefined,
          ].filter(Boolean),
        };
        return Promise.all([
          prisma.certification.count({ where }),
          prisma.certification
            .findMany({
              where,
              orderBy,
              take: takePerKind,
              select: {
                id: true,
                slug: true,
                title: true,
                issuer: true,
                year: true,
                createdAt: true,
              },
            })
            .then((rows) => rows.map((r) => shape('certification', r))),
        ]);
      }
      default:
        return Promise.all([Promise.resolve(0), Promise.resolve([])]);
    }
  });

  const results = await Promise.all(promises);
  const total = results.reduce((acc, [cnt]) => acc + cnt, 0);
  const merged = results.flatMap(([, rows]) => rows);

  // Global sort (mirror orderBy; default is [{ createdAt:'desc'}])
  // We support up to 2 fields for simplicity
  const orderKeys = orderBy.length ? orderBy : [{ createdAt: 'desc' }];
  const sorted = merged.sort((a, b) => {
    for (const ob of orderKeys) {
      const key = Object.keys(ob)[0];
      const dir = ob[key] === 'desc' ? -1 : 1;
      const av = a[key] ?? null,
        bv = b[key] ?? null;
      if (av === bv) continue;
      return (av > bv ? 1 : -1) * dir;
    }
    return 0;
  });

  const data = sorted.slice(offset, offset + s);
  const pages = Math.max(1, Math.ceil(total / s));

  return { data, total, page: p, pageSize: s, pages };
}

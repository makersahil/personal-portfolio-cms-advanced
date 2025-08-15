import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

export async function listGrants(query) {
  const { q, year, page, pageSize, sort } = query;
  const { skip, take, page: p, pageSize: s } = makePagination(page, pageSize);

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

  const orderBy = parseSort(sort, ['year', 'title', 'createdAt']);

  const [total, data] = await Promise.all([
    prisma.researchGrant.count({ where }),
    prisma.researchGrant.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        year: true,
        amount: true,
        link: true,
      },
    }),
  ]);

  return { data, total, page: p, pageSize: s };
}

export function getGrantBySlug(slug) {
  return prisma.researchGrant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      year: true,
      amount: true,
      link: true,
      published: true,
    },
  });
}

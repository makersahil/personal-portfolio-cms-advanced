// Public: Prisma queries + DTO shaping
import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

export async function listCertifications(query) {
  const { q, year, page, pageSize, sort } = query;
  const { skip, take, page: p, pageSize: s } = makePagination(page, pageSize);

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

  const orderBy = parseSort(sort, ['year', 'title', 'createdAt']);

  const [total, data] = await Promise.all([
    prisma.certification.count({ where }),
    prisma.certification.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        issuer: true,
        year: true,
        link: true,
      },
    }),
  ]);

  return { data, total, page: p, pageSize: s };
}

export async function getCertificationBySlug(slug) {
  const item = await prisma.certification.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      issuer: true,
      year: true,
      link: true,
      published: true,
    },
  });
  if (!item || item.published === false) return null;
  return item;
}

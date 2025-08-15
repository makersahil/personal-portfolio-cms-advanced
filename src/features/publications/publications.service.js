import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

export async function listPublications(query) {
  const { q, type, year, tag, page, pageSize, sort } = query;
  const { skip, take, page: p, pageSize: s } = makePagination(page, pageSize);

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

  const orderBy = parseSort(sort, ['year', 'title', 'createdAt']);

  const [total, data] = await Promise.all([
    prisma.publication.count({ where }),
    prisma.publication.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        publisher: true,
        type: true,
        year: true,
        link: true,
        tags: true,
      },
    }),
  ]);

  return { data, total, page: p, pageSize: s };
}

export async function getPublicationBySlug(slug) {
  return prisma.publication.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      publisher: true,
      type: true,
      year: true,
      link: true,
      tags: true,
      published: true,
    },
  });
}

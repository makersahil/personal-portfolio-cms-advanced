import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

export async function listArticles(query) {
  const { q, year, tag, page, pageSize, sort } = query;
  const { skip, take, page: p, pageSize: s } = makePagination(page, pageSize);

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

  const orderBy = parseSort(sort, ['year', 'title', 'createdAt']);

  const [total, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        journal: true,
        year: true,
        tags: true,
        legacyAuthors: true,
        authors: {
          orderBy: { position: 'asc' },
          select: {
            position: true,
            author: { select: { firstName: true, lastName: true, affiliation: true } },
          },
        },
      },
    }),
  ]);

  const data = items.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    journal: a.journal,
    year: a.year,
    tags: a.tags,
    authorsList: a.authors.map((x) => x.author),
    legacyAuthors: a.legacyAuthors || null,
  }));

  return { data, total, page: p, pageSize: s };
}

export async function getArticleBySlug(slug) {
  const a = await prisma.article.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      abstract: true,
      journal: true,
      year: true,
      doi: true,
      link: true,
      tags: true,
      legacyAuthors: true,
      authors: {
        orderBy: { position: 'asc' },
        select: {
          position: true,
          author: { select: { firstName: true, lastName: true, affiliation: true } },
        },
      },
    },
  });
  if (!a || a.published === false) return null; // if you later expose unpublished via admin, adjust
  return {
    ...a,
    authorsList: a.authors.map((x) => x.author),
  };
}

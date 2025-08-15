import prisma from '../../config/db.js';
import { makePagination } from '../../utils/pagination.js';
import { parseSort } from '../../utils/sort.js';

export async function listPatents(query) {
  const { q, year, page, pageSize, sort } = query;
  const { skip, take, page: p, pageSize: s } = makePagination(page, pageSize);

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

  const orderBy = parseSort(sort, ['year', 'title', 'createdAt']);

  const [total, items] = await Promise.all([
    prisma.patent.count({ where }),
    prisma.patent.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        country: true,
        patentNo: true,
        year: true,
        link: true,
        legacyInventors: true,
        inventors: {
          orderBy: { position: 'asc' },
          select: {
            position: true,
            inventor: { select: { firstName: true, lastName: true, affiliation: true } },
          },
        },
      },
    }),
  ]);

  const data = items.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    country: p.country,
    patentNo: p.patentNo,
    year: p.year,
    link: p.link,
    inventorsList: p.inventors.map((x) => x.inventor),
    legacyInventors: p.legacyInventors || null,
  }));

  return { data, total, page: p, pageSize: s };
}

export async function getPatentBySlug(slug) {
  const p = await prisma.patent.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      country: true,
      patentNo: true,
      year: true,
      link: true,
      legacyInventors: true,
      published: true,
      inventors: {
        orderBy: { position: 'asc' },
        select: {
          position: true,
          inventor: { select: { firstName: true, lastName: true, affiliation: true } },
        },
      },
    },
  });
  if (!p) return null;
  return { ...p, inventorsList: p.inventors.map((x) => x.inventor) };
}

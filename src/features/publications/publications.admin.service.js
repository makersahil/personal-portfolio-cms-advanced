import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { recordAudit } from '../../services/audit.service.js';

export async function createPublication(actorId, body) {
  const {
    title,
    description,
    publisher,
    type,
    year,
    link,
    tags = [],
    published = true,
    slug,
  } = body;
  const computedSlug = slug || slugify(title);

  const created = await prisma.$transaction(async (tx) => {
    const pub = await tx.publication.create({
      data: {
        title,
        description,
        publisher: publisher ?? null,
        type,
        year,
        link: link ?? null,
        tags,
        slug: computedSlug,
        published,
      },
    });
    await recordAudit(tx, {
      actorId,
      action: 'CREATE',
      entity: 'Publication',
      entityId: pub.id,
      before: null,
      after: pub,
    });
    return pub;
  });

  return created;
}

export async function updatePublication(actorId, id, body) {
  const current = await prisma.publication.findUnique({ where: { id } });
  if (!current) return null;

  const { title, description, publisher, type, year, link, tags, published, slug } = body;
  const newSlug = slug ? slug : title ? slugify(title) : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const after = await tx.publication.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(publisher !== undefined ? { publisher } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(link !== undefined ? { link } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
      },
    });
    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'Publication',
      entityId: id,
      before: current,
      after,
    });
    return after;
  });

  return updated;
}

export async function deletePublication(actorId, id) {
  const current = await prisma.publication.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.$transaction(async (tx) => {
    await tx.publication.delete({ where: { id } });
    await recordAudit(tx, {
      actorId,
      action: 'DELETE',
      entity: 'Publication',
      entityId: id,
      before: current,
      after: null,
    });
  });

  return true;
}

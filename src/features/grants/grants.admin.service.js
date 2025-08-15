import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { recordAudit } from '../../services/audit.service.js';

export async function createGrant(actorId, body) {
  const { title, summary, year, amount, link, published = true, slug } = body;
  const computedSlug = slug || slugify(title);

  const created = await prisma.$transaction(async (tx) => {
    const grant = await tx.researchGrant.create({
      data: {
        title,
        summary,
        year,
        amount: amount ?? null,
        link: link ?? null,
        published,
        slug: computedSlug,
      },
    });
    await recordAudit(tx, {
      actorId,
      action: 'CREATE',
      entity: 'ResearchGrant',
      entityId: grant.id,
      before: null,
      after: grant,
    });
    return grant;
  });

  return created;
}

export async function updateGrant(actorId, id, body) {
  const current = await prisma.researchGrant.findUnique({ where: { id } });
  if (!current) return null;

  const { title, summary, year, amount, link, published, slug } = body;
  const newSlug = slug ? slug : title ? slugify(title) : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const after = await tx.researchGrant.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(link !== undefined ? { link } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
      },
    });
    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'ResearchGrant',
      entityId: id,
      before: current,
      after,
    });
    return after;
  });

  return updated;
}

export async function deleteGrant(actorId, id) {
  const current = await prisma.researchGrant.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.$transaction(async (tx) => {
    await tx.researchGrant.delete({ where: { id } });
    await recordAudit(tx, {
      actorId,
      action: 'DELETE',
      entity: 'ResearchGrant',
      entityId: id,
      before: current,
      after: null,
    });
  });

  return true;
}

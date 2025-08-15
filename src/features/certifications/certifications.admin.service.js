import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { recordAudit } from '../../services/audit.service.js';

export async function createCertification(actorId, body) {
  const { title, issuer, year, link, published = true, slug } = body;
  const computedSlug = slug || slugify(title);

  const created = await prisma.$transaction(async (tx) => {
    const cert = await tx.certification.create({
      data: { title, issuer, year, link: link ?? null, published, slug: computedSlug },
    });
    await recordAudit(tx, {
      actorId,
      action: 'CREATE',
      entity: 'Certification',
      entityId: cert.id,
      before: null,
      after: cert,
    });
    return cert;
  });

  return created;
}

export async function updateCertification(actorId, id, body) {
  const current = await prisma.certification.findUnique({ where: { id } });
  if (!current) return null;

  const { title, issuer, year, link, published, slug } = body;
  const newSlug = slug ? slug : title ? slugify(title) : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const after = await tx.certification.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(issuer !== undefined ? { issuer } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(link !== undefined ? { link } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
      },
    });
    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'Certification',
      entityId: id,
      before: current,
      after,
    });
    return after;
  });

  return updated;
}

export async function deleteCertification(actorId, id) {
  const current = await prisma.certification.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.$transaction(async (tx) => {
    await tx.certification.delete({ where: { id } });
    await recordAudit(tx, {
      actorId,
      action: 'DELETE',
      entity: 'Certification',
      entityId: id,
      before: current,
      after: null,
    });
  });

  return true;
}

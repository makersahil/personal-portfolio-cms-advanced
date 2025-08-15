import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { buildLegacyInventors } from '../../utils/legacy.js';
import { recordAudit } from '../../services/audit.service.js';

async function syncInventorsTx(tx, patentId, inventorsList = []) {
  await tx.patentInventor.deleteMany({ where: { patentId } });
  if (!inventorsList?.length) return;

  const invRecords = [];
  for (const i of inventorsList) {
    const slug = slugify(`${i.firstName}-${i.lastName}`);
    let inv = await tx.inventor.findUnique({ where: { slug } });
    if (!inv) {
      inv = await tx.inventor.create({
        data: {
          slug,
          firstName: i.firstName,
          lastName: i.lastName,
          affiliation: i.affiliation ?? null,
        },
      });
    }
    invRecords.push(inv);
  }
  for (let p = 0; p < invRecords.length; p++) {
    await tx.patentInventor.create({
      data: { patentId, inventorId: invRecords[p].id, position: p + 1 },
    });
  }
}

export async function createPatent(actorId, body) {
  const {
    title,
    country,
    patentNo,
    year,
    link,
    published = true,
    slug,
    legacyInventors,
    inventorsList,
  } = body;
  const computedSlug = slug || slugify(title);
  const computedLegacy = legacyInventors ?? buildLegacyInventors(inventorsList);

  const created = await prisma.$transaction(async (tx) => {
    const pat = await tx.patent.create({
      data: {
        title,
        country,
        patentNo,
        year,
        link: link ?? null,
        slug: computedSlug,
        legacyInventors: computedLegacy ?? null,
        published,
      },
    });

    if (inventorsList?.length) {
      await syncInventorsTx(tx, pat.id, inventorsList);
    }

    await recordAudit(tx, {
      actorId,
      action: 'CREATE',
      entity: 'Patent',
      entityId: pat.id,
      before: null,
      after: pat,
    });
    return pat;
  });

  return created;
}

export async function updatePatent(actorId, id, body) {
  const current = await prisma.patent.findUnique({ where: { id } });
  if (!current) return null;

  const { title, country, patentNo, year, link, published, slug, legacyInventors, inventorsList } =
    body;
  const newSlug = slug ? slug : title ? slugify(title) : undefined;
  const newLegacy =
    legacyInventors !== undefined
      ? legacyInventors
      : inventorsList
        ? buildLegacyInventors(inventorsList)
        : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const after = await tx.patent.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(patentNo !== undefined ? { patentNo } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(link !== undefined ? { link } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
        ...(newLegacy !== undefined ? { legacyInventors: newLegacy } : {}),
      },
    });

    if (inventorsList) {
      await syncInventorsTx(tx, id, inventorsList);
    }

    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'Patent',
      entityId: id,
      before: current,
      after,
    });
    return after;
  });

  return updated;
}

export async function deletePatent(actorId, id) {
  const current = await prisma.patent.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.$transaction(async (tx) => {
    await tx.patent.delete({ where: { id } }); // cascades to PatentInventor
    await recordAudit(tx, {
      actorId,
      action: 'DELETE',
      entity: 'Patent',
      entityId: id,
      before: current,
      after: null,
    });
  });

  return true;
}

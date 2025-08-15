import prisma from '../../config/db.js';
import { recordAudit } from '../../services/audit.service.js';

export async function getAdminProfile() {
  return prisma.profile.findFirst({ orderBy: { updatedAt: 'desc' } });
}

export async function updateAdminProfile(actorId, body) {
  // ensure a singleton exists
  let current = await prisma.profile.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (!current) {
    current = await prisma.profile.create({
      data: { name: 'Profile', title: '', bio: '', published: true },
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const before = current;
    const after = await tx.profile.update({
      where: { id: current.id },
      data: { ...body },
    });
    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'Profile',
      entityId: current.id,
      before,
      after,
    });
    return after;
  });

  return updated;
}

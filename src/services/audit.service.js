// tx = Prisma transaction client
export async function recordAudit(tx, { actorId, action, entity, entityId, before, after }) {
  return tx.auditLog.create({
    data: {
      actorId: actorId ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      before: before ?? null,
      after: after ?? null,
    },
  });
}

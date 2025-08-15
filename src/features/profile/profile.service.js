import prisma from '../../config/db.js';

export async function getPublicProfile() {
  return prisma.profile.findFirst({
    where: { published: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      name: true,
      title: true,
      bio: true,
      avatarUrl: true,
      contactEmail: true,
      phone: true,
      socials: true,
      updatedAt: true,
    },
  });
}

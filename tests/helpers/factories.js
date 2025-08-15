// Minimal factories for creating domain data
import { randomUUID } from 'node:crypto';

import prisma from './prisma.js';

export async function upsertProfile(data = {}) {
  const def = {
    name: 'Dr. Tripuresh Joshi',
    title: 'Professor of Computer Science',
    bio: 'Research in AI and Systems.',
    published: true,
  };
  const payload = { ...def, ...data };
  const existing = await prisma.profile.findFirst({});
  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data: payload });
  }
  return prisma.profile.create({ data: payload });
}

export async function createArticle(data = {}) {
  const def = {
    title: 'Sample Article',
    abstract: 'Abstract...',
    journal: 'Journal X',
    year: 2024,
    slug: `article-${randomUUID()}`.slice(0, 30),
    published: true,
    tags: ['ai'],
  };
  return prisma.article.create({ data: { ...def, ...data } });
}

export async function createPublication(data = {}) {
  const def = {
    title: 'Book Title',
    description: 'Desc...',
    publisher: 'Publisher',
    type: 'Book',
    year: 2023,
    slug: `pub-${randomUUID()}`.slice(0, 30),
    published: true,
  };
  return prisma.publication.create({ data: { ...def, ...data } });
}

export async function createGrant(data = {}) {
  const def = {
    title: 'ML in Healthcare',
    summary: 'Applying ML to diagnostics',
    year: 2023,
    slug: `grant-${randomUUID()}`.slice(0, 30),
    published: true,
  };
  return prisma.researchGrant.create({ data: { ...def, ...data } });
}

export async function createPatent(data = {}) {
  const def = {
    title: 'Smart Device',
    country: 'IN',
    patentNo: `IN-${Math.floor(Math.random() * 1e6)}`,
    year: 2022,
    slug: `pat-${randomUUID()}`.slice(0, 30),
    published: true,
  };
  return prisma.patent.create({ data: { ...def, ...data } });
}

export async function createCertification(data = {}) {
  const def = {
    title: 'AWS Architect',
    issuer: 'Amazon',
    year: 2024,
    slug: `cert-${randomUUID()}`.slice(0, 30),
    published: true,
  };
  return prisma.certification.create({ data: { ...def, ...data } });
}

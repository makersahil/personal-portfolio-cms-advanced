import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';
import { buildLegacyAuthors } from '../../utils/legacy.js';
import { recordAudit } from '../../services/audit.service.js';

async function syncAuthorsTx(tx, articleId, authorsList = []) {
  // wipe old links
  await tx.articleAuthor.deleteMany({ where: { articleId } });

  if (!authorsList?.length) return;

  // ensure authors exist (by slug of name)
  const authorRecords = [];
  for (const a of authorsList) {
    const slug = slugify(`${a.firstName}-${a.lastName}`);
    let author = await tx.author.findUnique({ where: { slug } });
    if (!author) {
      author = await tx.author.create({
        data: {
          slug,
          firstName: a.firstName,
          lastName: a.lastName,
          affiliation: a.affiliation ?? null,
        },
      });
    }
    authorRecords.push(author);
  }

  // link authors with positions
  for (let i = 0; i < authorRecords.length; i++) {
    await tx.articleAuthor.create({
      data: { articleId, authorId: authorRecords[i].id, position: i + 1 },
    });
  }
}

export async function createArticle(actorId, body) {
  const {
    title,
    abstract,
    journal,
    year,
    doi,
    link,
    tags = [],
    published = true,
    slug,
    legacyAuthors,
    authorsList,
  } = body;

  const computedSlug = slug || slugify(title);
  const computedLegacy = legacyAuthors ?? buildLegacyAuthors(authorsList);

  const created = await prisma.$transaction(async (tx) => {
    const article = await tx.article.create({
      data: {
        title,
        abstract: abstract ?? null,
        journal,
        year,
        doi: doi ?? null,
        link: link ?? null,
        tags,
        published,
        slug: computedSlug,
        legacyAuthors: computedLegacy ?? null,
      },
    });

    if (authorsList?.length) {
      await syncAuthorsTx(tx, article.id, authorsList);
    }

    await recordAudit(tx, {
      actorId,
      action: 'CREATE',
      entity: 'Article',
      entityId: article.id,
      before: null,
      after: article,
    });

    return article;
  });

  return created;
}

export async function updateArticle(actorId, id, body) {
  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) return null;

  const {
    title,
    abstract,
    journal,
    year,
    doi,
    link,
    tags,
    published,
    slug,
    legacyAuthors,
    authorsList,
  } = body;

  const newSlug = slug ? slug : title ? slugify(title) : undefined;
  const newLegacy =
    legacyAuthors !== undefined
      ? legacyAuthors
      : authorsList
        ? buildLegacyAuthors(authorsList)
        : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const after = await tx.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(abstract !== undefined ? { abstract } : {}),
        ...(journal !== undefined ? { journal } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(doi !== undefined ? { doi } : {}),
        ...(link !== undefined ? { link } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
        ...(newLegacy !== undefined ? { legacyAuthors: newLegacy } : {}),
      },
    });

    if (authorsList) {
      await syncAuthorsTx(tx, id, authorsList);
    }

    await recordAudit(tx, {
      actorId,
      action: 'UPDATE',
      entity: 'Article',
      entityId: id,
      before: current,
      after,
    });

    return after;
  });

  return updated;
}

export async function deleteArticle(actorId, id) {
  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) return null;

  await prisma.$transaction(async (tx) => {
    await tx.article.delete({ where: { id } }); // cascades to ArticleAuthor
    await recordAudit(tx, {
      actorId,
      action: 'DELETE',
      entity: 'Article',
      entityId: id,
      before: current,
      after: null,
    });
  });

  return true;
}

-- CreateEnum
CREATE TYPE "public"."PublicationType" AS ENUM ('Book', 'Conference', 'Chapter');

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "socials" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Author" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "affiliation" TEXT,
    "email" TEXT,
    "orcid" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "journal" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "link" TEXT,
    "slug" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "legacyAuthors" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticleAuthor" (
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ArticleAuthor_pkey" PRIMARY KEY ("articleId","authorId")
);

-- CreateTable
CREATE TABLE "public"."Publication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "publisher" TEXT,
    "type" "public"."PublicationType" NOT NULL,
    "year" INTEGER NOT NULL,
    "link" TEXT,
    "slug" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inventor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "affiliation" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "patentNo" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "link" TEXT,
    "slug" TEXT NOT NULL,
    "legacyInventors" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatentInventor" (
    "patentId" TEXT NOT NULL,
    "inventorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PatentInventor_pkey" PRIMARY KEY ("patentId","inventorId")
);

-- CreateTable
CREATE TABLE "public"."ResearchGrant" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" INTEGER,
    "link" TEXT,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "link" TEXT,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profile_updatedAt_idx" ON "public"."Profile"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "public"."Author"("slug");

-- CreateIndex
CREATE INDEX "Author_lastName_firstName_idx" ON "public"."Author"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "public"."Article"("slug");

-- CreateIndex
CREATE INDEX "Article_year_idx" ON "public"."Article"("year");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "public"."Article"("createdAt");

-- CreateIndex
CREATE INDEX "Article_title_idx" ON "public"."Article"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleAuthor_articleId_position_key" ON "public"."ArticleAuthor"("articleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_slug_key" ON "public"."Publication"("slug");

-- CreateIndex
CREATE INDEX "Publication_year_idx" ON "public"."Publication"("year");

-- CreateIndex
CREATE INDEX "Publication_type_idx" ON "public"."Publication"("type");

-- CreateIndex
CREATE INDEX "Publication_title_idx" ON "public"."Publication"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Inventor_slug_key" ON "public"."Inventor"("slug");

-- CreateIndex
CREATE INDEX "Inventor_lastName_firstName_idx" ON "public"."Inventor"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_slug_key" ON "public"."Patent"("slug");

-- CreateIndex
CREATE INDEX "Patent_year_idx" ON "public"."Patent"("year");

-- CreateIndex
CREATE INDEX "Patent_title_idx" ON "public"."Patent"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_country_patentNo_key" ON "public"."Patent"("country", "patentNo");

-- CreateIndex
CREATE UNIQUE INDEX "PatentInventor_patentId_position_key" ON "public"."PatentInventor"("patentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchGrant_slug_key" ON "public"."ResearchGrant"("slug");

-- CreateIndex
CREATE INDEX "ResearchGrant_year_idx" ON "public"."ResearchGrant"("year");

-- CreateIndex
CREATE INDEX "ResearchGrant_title_idx" ON "public"."ResearchGrant"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_slug_key" ON "public"."Certification"("slug");

-- CreateIndex
CREATE INDEX "Certification_year_idx" ON "public"."Certification"("year");

-- CreateIndex
CREATE INDEX "Certification_title_idx" ON "public"."Certification"("title");

-- AddForeignKey
ALTER TABLE "public"."ArticleAuthor" ADD CONSTRAINT "ArticleAuthor_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleAuthor" ADD CONSTRAINT "ArticleAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatentInventor" ADD CONSTRAINT "PatentInventor_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "public"."Patent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatentInventor" ADD CONSTRAINT "PatentInventor_inventorId_fkey" FOREIGN KEY ("inventorId") REFERENCES "public"."Inventor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

# Dr. Tripuresh Joshi — Portfolio Backend

## Domain & API Data Model Specification

> Purpose: lock the domain schema, field constraints, and public/admin API shape before further implementation. This document guides Prisma modeling, service logic, and endpoint contracts.

---

## 1) Conventions

- **IDs**: `String` UUIDs.
- **Timestamps**: `createdAt`, `updatedAt` (`updatedAt` via Prisma `@updatedAt` where needed).
- **Slugs**: URL-safe, unique per entity (`[a-z0-9-]`), stable unless the title changes. If title changes, slug may remain unless explicitly updated.
- **Published**: `Boolean` (default `true`) on public content. Unpublished items only visible in admin endpoints.
- **Soft delete**: Optional `deletedAt` (nullable `DateTime`). Not exposed in public endpoints.
- **Year**: `Int` four-digit.
- **Links**: Optional `String` (absolute URLs).
- **Tags**: Optional `String[]` where relevant.
- **Response envelope**:
  - Success: `{ "success": true, "data": <payload>, "meta"?: {...} }`
  - Error: `{ "success": false, "code": "<ERROR_CODE>", "message": "<human readable>", "details"?: {...} }`
- **Pagination** (cursor-less, simple page/size):
  - Query: `?page=1&pageSize=20`
  - Meta: `{ "page": 1, "pageSize": 20, "total": 135, "pages": 7 }`
- **Filtering**:
  - `q` (title/description contains, case-insensitive)
  - `year` (exact), `yearFrom`, `yearTo`
  - `type` (for publications)
  - `tag` (single; later may accept `tags[]=`)
  - `published` (admin-only filter)
- **Sorting**:
  - `sort` accepts comma list of fields, `-` for desc. E.g. `sort=-year,title`.

---

## 2) Entities & Fields

### 2.1 Admin (for authentication)

- `id: String @id @default(uuid())`
- `email: String @unique`
- `passwordHash: String`
- `role: String @default("admin")` _(future-proof for roles)_
- `createdAt: DateTime @default(now())`

### 2.2 Profile (singleton)

- `id: String @id @default(uuid())`
- `name: String`
- `title: String`
- `bio: String`
- `avatarUrl: String?`
- `contactEmail: String?`
- `phone: String?`
- `socials: Json?` _(e.g., { website, googleScholar, researchGate, orcid, linkedin, x })_
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

**API**:

- Public: `GET /profile` (only the _published_ version)
- Admin: `GET /admin/profile`, `PUT /admin/profile`

---

### 2.3 Author (normalized)

- `id: String @id @default(uuid())`
- `firstName: String`
- `lastName: String`
- `affiliation: String?`
- `email: String?`
- `orcid: String?`
- `slug: String @unique`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

### 2.4 Article

- `id: String @id @default(uuid())`
- `title: String`
- `abstract: String?` _(description)_
- `journal: String`
- `year: Int`
- `doi: String?`
- `link: String?`
- `slug: String @unique`
- `tags: String[] @default([])`
- `legacyAuthors: String?` _(compatibility string)_
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`
- **Relations**:
  - `authors: ArticleAuthor[]`

### 2.5 ArticleAuthor (order-preserving join)

- `articleId: String`
- `authorId: String`
- `position: Int`
- `@@id([articleId, authorId])`
- `@@unique([articleId, position])`

**API (public)**:

- `GET /articles?q=&year=&tag=&page=&pageSize=&sort=`
- `GET /articles/:slug` (includes ordered authors)

**API (admin)**:

- `POST /admin/articles`
- `PUT /admin/articles/:id`
- `DELETE /admin/articles/:id`

---

### 2.6 Inventor (normalized)

- `id: String @id @default(uuid())`
- `firstName: String`
- `lastName: String`
- `affiliation: String?`
- `slug: String @unique`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

### 2.7 Patent

- `id: String @id @default(uuid())`
- `title: String`
- `country: String`
- `patentNo: String`
- `year: Int`
- `link: String?`
- `slug: String @unique`
- `legacyInventors: String?` _(compat string)_
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`
- **Relations**:
  - `inventors: PatentInventor[]`
- **Constraint**:
  - `@@unique([country, patentNo])`

**API (public)**:

- `GET /patents?q=&year=&page=&pageSize=&sort=`
- `GET /patents/:slug`

**API (admin)**:

- `POST /admin/patents`
- `PUT /admin/patents/:id`
- `DELETE /admin/patents/:id`

---

### 2.8 Publication

- `id: String @id @default(uuid())`
- `title: String`
- `description: String`
- `publisher: String?`
- `type: PublicationType` _(enum: `Book | Conference | Chapter`)_
- `year: Int`
- `link: String?`
- `slug: String @unique`
- `tags: String[] @default([])`
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

**API (public)**:

- `GET /publications?q=&type=&year=&tag=&page=&pageSize=&sort=`
- `GET /publications/:slug`

**API (admin)**:

- `POST /admin/publications`
- `PUT /admin/publications/:id`
- `DELETE /admin/publications/:id`

---

### 2.9 ResearchGrant

- `id: String @id @default(uuid())`
- `title: String`
- `summary: String` _(long text body)_
- `year: Int`
- `amount: Int?` _(stored as cents or whole units; optional)_
- `link: String?`
- `slug: String @unique`
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

**API (public)**:

- `GET /grants?q=&year=&page=&pageSize=&sort=`
- `GET /grants/:slug`

**API (admin)**:

- `POST /admin/grants`
- `PUT /admin/grants/:id`
- `DELETE /admin/grants/:id`

---

### 2.10 Certification

- `id: String @id @default(uuid())`
- `title: String`
- `issuer: String`
- `year: Int`
- `link: String?`
- `slug: String @unique`
- `published: Boolean @default(true)`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

**API (public)**:

- `GET /certifications?q=&year=&page=&pageSize=&sort=`

**API (admin)**:

- `POST /admin/certifications`
- `PUT /admin/certifications/:id`
- `DELETE /admin/certifications/:id`

---

## 3) Compatibility Mode (Authors & Inventors)

To keep legacy content sources compatible:

- **On write** (admin endpoints):
  - Accept **either** a legacy string (`legacyAuthors`/`legacyInventors`) **or** a structured list (`authorsList` / `inventorsList`), where each item = `{ firstName, lastName, affiliation? }` or `{ authorId }` references.
  - If a structured list is provided, write the normalized tables (`Author`, `ArticleAuthor`, `Inventor`, `PatentInventor`) and **optionally** store a synthesized legacy string for compatibility.
- **On read** (public and admin):
  - Return **both** `authorsList` and `legacyAuthors` (or inventors). Ordering is guaranteed via the join table’s `position`.
- **Backfill script** (optional later):
  - Parse legacy strings into structured rows deterministically (split delimiters like `;, &`).

---

## 4) Indexing & Performance

- Add indexes for frequent filters:
  - `LOWER(title)` (text search on title)
  - `year`
  - `type` (Publication)
  - `slug` (unique)
  - `tags` (if array contains used often; otherwise app-level filtering)
- Patent: `@@unique([country, patentNo])`
- Consider composite indexes for query shapes, e.g., `(type, year)` for Publications lists.

**Search strategy (initial)**:

- `ILIKE` across `title`, maybe `description`, using `LOWER(...)` index on title for speed.
- Optionally consider `pg_trgm` + GIN later for fuzzy search on larger datasets.

---

## 5) Public API (Read-Only) — MVP

Each “list” uses pagination, sorting, and filters. Examples:

### 5.1 Articles

**List**: `GET /articles?q=&year=&tag=&page=&pageSize=&sort=-year,title`  
**Detail**: `GET /articles/:slug`

**List Response (example)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "quantum-neural-networks",
      "title": "Quantum Neural Networks",
      "journal": "Nature AI",
      "year": 2024,
      "tags": ["quantum", "ai"],
      "authorsList": [
        { "firstName": "Tripuresh", "lastName": "Joshi" },
        { "firstName": "Rai", "lastName": "A." }
      ],
      "legacyAuthors": "Tripuresh Joshi; A. Rai"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 53, "pages": 3 }
}
```

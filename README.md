# Professor Portfolio Backend — README

A clean, modular **Fastify + Prisma** backend for a professor’s personal portfolio. This serves public content (profile, articles, publications, grants, patents, certifications, search) and provides protected admin CRUD via JWT.

> **Tech stack:** Fastify (Node 20, ESM), Prisma (PostgreSQL), Zod, JWT, Pino, Vitest  
> **Docs:** Swagger UI (`/docs` in dev/test), OpenAPI JSON (`/docs/json`)  
> **Obs:** JSON logs, Prometheus metrics (`/metrics`), health checks (`/health/*`)

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Getting Started](#getting-started)
5. [Scripts](#scripts)
6. [Database Schema (Prisma)](#database-schema-prisma)
7. [API Design & Conventions](#api-design--conventions)
8. [Public Endpoints](#public-endpoints)
9. [Auth (Admin)](#auth-admin)
10. [Admin CRUD Endpoints](#admin-crud-endpoints)
11. [Search](#search)
12. [Observability](#observability)
13. [Security](#security)
14. [Testing](#testing)
15. [Deployment Checklist](#deployment-checklist)
16. [Postman / Collections](#postman--collections)

---

## Features

- Public read endpoints for **Profile**, **Articles**, **Publications**, **Grants**, **Patents**, **Certifications**
- Unified **Search** endpoint
- Protected **Admin** CRUD (JWT Bearer)
- Strong **validation** with Zod; consistent response envelopes
- **OpenAPI** docs, **Prometheus** metrics, **structured logs**
- Thoughtful **caching** (ETag/Last-Modified) optional and safe by default
- **Rate limiting**, strict **CORS**, JSON-only for mutating requests

---

## Project Structure

```text
src/
  app.js
  server.js
  config/
    env.js
    logger.js
    db.js
    security.js
  routes/
    index.js
    health.route.js
    metrics.route.js
  docs/
    openapi.plugin.js
    zod.js
    envelopes.js
  middleware/
    auth.middleware.js
  utils/
    httpCache.js
    pagination.js
    sort.js
  features/
    profile/
      profile.route.js
      profile.service.js
      profile.validator.js
    articles/
      article.route.js
      article.service.js
      article.validator.js
    publications/
      publication.route.js
      publication.service.js
      publication.validator.js
    grants/
      grant.route.js
      grant.service.js
      grant.validator.js
    patents/
      patent.route.js
      patent.service.js
      patent.validator.js
    certifications/
      certification.route.js
      certification.service.js
      certification.validator.js
    auth/
      auth.route.js
      auth.controller.js
      auth.service.js
      auth.validator.js
prisma/
  schema.prisma
  migrations/
tests/
  ...
```

> **Naming rule:** feature folders are **plural** (articles, publications, …). **profile** uses singular internally.

---

## Environment Variables

| Key                      | Required | Example                                    | Notes                              |
| ------------------------ | -------- | ------------------------------------------ | ---------------------------------- |
| `NODE_ENV`               | no       | `development`                              | `development`/`test`/`production`  |
| `PORT`                   | no       | `5000`                                     | Default 5000                       |
| `DATABASE_URL`           | yes      | `postgresql://user:pass@localhost:5432/db` | App role with least privilege      |
| `JWT_ACCESS_SECRET`      | yes      | `min 16 chars`                             | Access token secret                |
| `JWT_REFRESH_SECRET`     | yes      | `min 16 chars`                             | If refresh flow is used            |
| `JWT_ACCESS_SECRET_PREV` | no       | `…`                                        | Optional **key rotation** fallback |
| `CORS_ORIGINS`           | no       | `https://your.site,http://localhost:5173`  | CSV allowlist                      |
| `RATE_LIMIT_GLOBAL`      | no       | `300`                                      | Per-IP per minute (all routes)     |
| `RATE_LIMIT_AUTH`        | no       | `10`                                       | Per-IP per minute (login route)    |
| `BODY_LIMIT`             | no       | `1048576`                                  | Max request body size (bytes)      |
| `HSTS_ENABLED`           | no       | `true`                                     | Adds HSTS on HTTPS                 |
| `METRICS_ENABLED`        | no       | `true`                                     | Enables `/metrics`                 |

Add `.env` (dev) and `.env.test` (test DB URL, tighter limits).

---

## Getting Started

```bash
# 1) Install deps
npm install

# 2) Prisma generate & migrate
npx prisma generate
npx prisma migrate dev --name init

# 3) (Optional) Seed a dev admin
node scripts/seed.js    # or npm run seed if present

# 4) Run dev server (ESM)
npm run dev

# 5) Health check
curl http://localhost:5000/health/live
```

Open API docs in dev/test:

- UI: `http://localhost:5000/docs`
- JSON: `http://localhost:5000/docs/json`

Export OpenAPI for clients/CI:

```bash
npm run docs:json > openapi.json
```

---

## Scripts

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "lint": "eslint .",
    "format": "prettier -w .",
    "test": "vitest",
    "test:run": "vitest run",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "seed": "node scripts/seed.js",
    "docs:json": "node -e \"(async()=>{const {default:build}=await import('./src/app.js');const app=await build();console.log(JSON.stringify(app.swagger(),null,2));await app.close();})()\""
  }
}
```

---

## Database Schema (Prisma)

> Representative schema (trimmed for brevity). Includes slugs, published flags, timestamps, and normalization for people lists.

```prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id        String   @id @default(uuid())
  name      String
  title     String?
  bio       String?
  links     Json?
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Article {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  abstract    String?
  journal     String?
  year        Int
  tags        String[] @default([])
  authors     String?  // legacy string
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  authorsList ArticleAuthor[]
  @@index([year])
  @@index([slug])
}

model Author {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  articles  ArticleAuthor[]
}

model ArticleAuthor {
  articleId String
  authorId  String
  order     Int
  article   Article @relation(fields: [articleId], references: [id])
  author    Author  @relation(fields: [authorId], references: [id])
  @@id([articleId, authorId])
}

model Publication {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  description String?
  publisher   String?
  type        String   // Book | Conference | Chapter | ...
  year        Int
  tags        String[] @default([])
  link        String?
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([type, year])
  @@index([slug])
}

model ResearchGrant {
  id        String   @id @default(uuid())
  slug      String   @unique
  title     String
  summary   String?
  year      Int
  amount    Int?
  link      String?
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([year])
}

model Patent {
  id        String   @id @default(uuid())
  slug      String   @unique
  title     String
  country   String
  patentNo  String
  year      Int
  link      String?
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  inventors PatentInventor[]
  @@unique([country, patentNo])
  @@index([year])
}

model Inventor {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  patents   PatentInventor[]
}

model PatentInventor {
  patentId  String
  inventorId String
  order     Int
  patent    Patent   @relation(fields: [patentId], references: [id])
  inventor  Inventor @relation(fields: [inventorId], references: [id])
  @@id([patentId, inventorId])
}

model Certification {
  id        String   @id @default(uuid())
  slug      String   @unique
  title     String
  issuer    String
  year      Int
  link      String?
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([year])
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String?
  action    String
  entity    String
  entityId  String?
  before    Json?
  after     Json?
  createdAt DateTime @default(now())
  @@index([entity, entityId])
}
```

---

## API Design & Conventions

**Base URL (local):** `http://localhost:5000`  
**Auth:** `Authorization: Bearer <JWT>` (admin endpoints)  
**Envelope (always):**

```json
// success
{ "success": true,  "data": <any>, "meta": { /* optional */ } }
// error
{ "success": false, "code": "STRING_CODE", "message": "Readable error", "details": {/* optional */} }
```

**Pagination:** `page` (1+), `pageSize` (1..100), returned in `meta`.  
**Sorting:** `sort` with comma-separated fields; prefix `-` for descending  
**Filtering:** common: `q`, `year`; feature-specific (e.g., publications `type`).  
**Errors:** 400/401/403/404/429/500 with error envelope.  
**Caching (public GETs):** may include `ETag`, `Last-Modified`, `Cache-Control`; clients may get **304** when unchanged.

---

## Public Endpoints

### Health

- `GET /health/live` → `{ success: true, status: "live" }`
- `GET /health/ready` → `{ success: true, status: "ready" }`

### Profile

- `GET /profile`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Tripuresh Joshi",
    "title": "Professor",
    "bio": "…",
    "links": { "homepage": "…" },
    "createdAt": "…"
  }
}
```

### Articles

- `GET /articles?q=&year=&page=&pageSize=&sort=`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "quantum-nn",
      "title": "Quantum Neural Nets",
      "journal": "Nature AI",
      "year": 2024,
      "createdAt": "…"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "total": 1, "pages": 1 }
}
```

- `GET /articles/:slug`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "quantum-nn",
    "title": "Quantum Neural Nets",
    "journal": "Nature AI",
    "year": 2024,
    "authorsList": [{ "firstName": "Tripuresh", "lastName": "Joshi" }],
    "authors": "Tripuresh Joshi",
    "abstract": "…",
    "tags": ["ai", "quantum"],
    "createdAt": "…"
  }
}
```

### Publications

- `GET /publications?q=&type=Book|Conference|Chapter&year=&page=&pageSize=&sort=`
- `GET /publications/:slug`

### Grants

- `GET /grants?q=&year=&page=&pageSize=&sort=`
- `GET /grants/:slug`

### Patents

- `GET /patents?q=&year=&page=&pageSize=&sort=`
- `GET /patents/:slug`

### Certifications

- `GET /certifications?q=&year=&page=&pageSize=&sort=`
- `GET /certifications/:slug`

_(Each list returns `{ success, data:[…], meta }`. Each detail returns `{ success, data:{…} }`.)_

---

## Auth (Admin)

### POST `/api/v1/auth/login`

```json
{ "email": "admin@tripuresh.in", "password": "••••••••" }
```

200:

```json
{
  "success": true,
  "data": { "token": "<JWT>", "admin": { "id": "uuid", "email": "admin@tripuresh.in" } }
}
```

### GET `/api/v1/auth/me` _(Bearer)_

```json
{ "success": true, "data": { "id": "uuid", "email": "admin@tripuresh.in" } }
```

---

## Admin CRUD Endpoints

> All require `Authorization: Bearer <JWT>`.

### Profile

- `GET /api/v1/admin/profile`
- `PUT /api/v1/admin/profile`

```json
{
  "name": "Dr. Tripuresh Joshi",
  "title": "Professor",
  "bio": "…",
  "links": { "homepage": "…" },
  "published": true
}
```

### Articles

- `POST /api/v1/admin/articles`

```json
{
  "title": "Quantum Neural Nets",
  "abstract": "…",
  "journal": "Nature AI",
  "year": 2024,
  "tags": ["ai", "quantum"],
  "authorsList": [{ "firstName": "Tripuresh", "lastName": "Joshi" }],
  "published": true
}
```

- `PUT /api/v1/admin/articles/:id`
- `DELETE /api/v1/admin/articles/:id`

### Publications

- `POST /api/v1/admin/publications`

```json
{
  "title": "AI & Society",
  "description": "…",
  "publisher": "Oxford",
  "type": "Book",
  "year": 2024,
  "tags": ["ai"],
  "published": true
}
```

- `PUT /api/v1/admin/publications/:id`
- `DELETE /api/v1/admin/publications/:id`

### Grants

- `POST /api/v1/admin/grants`

```json
{
  "title": "ML in Healthcare",
  "summary": "…",
  "year": 2023,
  "amount": 500000,
  "link": null,
  "published": true
}
```

- `PUT /api/v1/admin/grants/:id`
- `DELETE /api/v1/admin/grants/:id`

### Patents

- `POST /api/v1/admin/patents`

```json
{
  "title": "Smart Device",
  "country": "IN",
  "patentNo": "IN-123456",
  "year": 2022,
  "inventorsList": [{ "firstName": "Tripuresh", "lastName": "Joshi" }],
  "link": null,
  "published": true
}
```

- `PUT /api/v1/admin/patents/:id`
- `DELETE /api/v1/admin/patents/:id`

### Certifications

- `POST /api/v1/admin/certifications`

```json
{
  "title": "AWS Architect",
  "issuer": "Amazon",
  "year": 2024,
  "link": "https://verify…",
  "published": true
}
```

- `PUT /api/v1/admin/certifications/:id`
- `DELETE /api/v1/admin/certifications/:id`

---

## Search

### GET `/search`

**Query:**

- `q` _(text)_
- `kind` = `article|publication|grant|patent|certification` _(optional)_
- `type` _(for publications)_
- `year` _(optional)_
- `page`, `pageSize`, `sort` _(optional)_

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "kind": "article",
      "id": "uuid",
      "slug": "quantum-nn",
      "title": "Quantum Neural Nets",
      "year": 2024,
      "createdAt": "…"
    },
    {
      "kind": "publication",
      "id": "uuid",
      "slug": "ai-and-society",
      "title": "AI & Society",
      "type": "Book",
      "year": 2024,
      "createdAt": "…"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "total": 2, "pages": 1 }
}
```

---

## Observability

- **Logs:** JSON via Pino; secrets redacted; includes `reqId`, `statusCode`, `durationMs`.
- **Metrics:** `GET /metrics` (Prometheus). Key series:
  - `http_requests_total{method,route,status}`
  - `http_request_duration_seconds_bucket{…}`
  - `db_queries_total{model,action,success}`
  - `db_query_duration_seconds_bucket{…}`
- **Health:** `GET /health/live` (no deps), `GET /health/ready` (DB ping).
- **Docs:** Swagger UI (`/docs` in dev/test), raw OpenAPI JSON (`/docs/json`).

---

## Security

- **CORS allowlist** (`CORS_ORIGINS`), blocks unknown browser origins.
- **Rate limiting:** global + strict on `/api/v1/auth/login`.
- **Body limits:** JSON-only for mutating routes; `BODY_LIMIT` enforced.
- **Headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, optional `HSTS` on HTTPS.
- **JWT rotation:** optional `JWT_ACCESS_SECRET_PREV` accepted during a rotation window.
- **DB principle of least privilege:** app user restricted to its schema; cannot create databases.
- **Errors:** consistent envelopes; no stack traces in responses (logged only).

---

## Testing

- **Unit/Integration:** Vitest with Fastify’s `app.inject()`.
- **DB:** separate `.env.test` and `prisma migrate reset` for clean runs.
- **Smoke:** `/health/live`, `/health/ready`, `/docs/json` available.
- **Example:**

```bash
npm run test:run
```

---

## Deployment Checklist

- [ ] Secrets set in environment (no `.env` in prod)
- [ ] `prisma migrate deploy` successful
- [ ] App role has least-priv DB permissions
- [ ] CORS allowlist includes the frontend domain(s)
- [ ] `/docs` UI disabled in prod (only `/docs/json` if you keep it)
- [ ] Logs shipping configured; alert on error rate & latency
- [ ] Backups and restore playbook tested
- [ ] JWT rotation plan documented (if needed)

---

## Postman / Collections

Import into Postman for local dev:

- **Collection:** `Portfolio_Backend.postman_collection.json`
- **Environment:** `Portfolio_Backend.postman_environment.json`

> The login request auto-saves `{{token}}` to the environment. Admin folders already include the `Authorization: Bearer {{token}}` header.

---

### Example cURL

```bash
# Health
curl -s http://localhost:5000/health/live | jq

# Login (admin)
curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tripuresh.in","password":"admin@tripuresh"}' | jq

# Public lists
curl -s "http://localhost:5000/articles?page=1&pageSize=5&sort=-year" | jq '.meta, .data[0]'

# Search
curl -s "http://localhost:5000/search?q=ai&page=1&pageSize=10" | jq '.meta, .data[0]'

# Metrics (dev/test)
curl -s http://localhost:5000/metrics | head -n 30
```

# Dr. Tripuresh Joshi — Portfolio Backend

A clean, modular REST API for managing the research portfolio of **Dr. Tripuresh Joshi**.

## Tech Stack (Final)

- Node.js 20+
- Fastify v5+
- ESM modules (`"type": "module"`)
- Prisma ORM
- PostgreSQL (local)
- Zod (validation)
- Vitest (tests when needed)
- Pino (structured logs)
- JWT (auth)

## Architecture Decisions

- Feature-first folder structure (each domain: route, controller, service, schema)
- App factory pattern (`buildApp()`) for testability
- Local PostgreSQL only (no Docker for now)
- Keep code simple and modular
- Provide automated tests **only when necessary** (no phase-wise scaffolding)

## Getting Started (High-level)

1. Ensure PostgreSQL is running locally and you have a DB.
2. Create `.env` with `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, `PORT`.
3. Install dependencies and initialize Prisma migrations.
4. Run the dev server.

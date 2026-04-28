# Qred Case Study — Implementation Plan

## Context

Build a Node.js/TypeScript backend for Qred's mobile banking dashboard (card management, transactions, invoices). This is a job interview case study — each phase maps to a clean, demonstrable commit showing good engineering practices.

**Tech stack**: Fastify, Drizzle ORM, PostgreSQL (Docker), PGlite (tests), Vitest, Biome, Pino, Zod, Scalar (API docs)

**Architecture**: Route → Controller → Service → Serializer (thin layers, DI for DB/logger)

**Note on testing**: The requirements mention SQLite in-memory for service tests, but Drizzle ORM uses dialect-specific table builders (`pgTable` vs `sqliteTable`) — sharing schemas is impossible. **PGlite** (WASM Postgres, `@electric-sql/pglite`) runs in-process with zero Docker dependency, uses the exact same `pgTable` schema, and gives real Postgres behavior in tests. This is strictly better.

---

## Phase 1: Project Scaffolding

**Commit**: `feat: scaffold project with Fastify, Drizzle, Biome, and Vitest`

**Delivers**: Buildable, lintable, testable project with health-check endpoint.

**Structure**:
```
.gitignore, .nvmrc, package.json, tsconfig.json, biome.json
vitest.config.ts, docker-compose.yml, drizzle.config.ts
src/
  index.ts                        # entrypoint (listen)
  server.ts                       # app factory (accepts db via DI)
  config/env.ts                   # Zod-validated env vars
  plugins/
    swagger.ts                    # @fastify/swagger + Scalar
    request-context.ts            # request UUID + Pino child logger
  lib/
    db/client.ts                  # drizzle(postgres(...))
    db/schema/index.ts            # barrel (empty)
    errors/app-error.ts           # AppError class (statusCode, message, errorCode)
    errors/error-handler.ts       # Fastify error handler
    logger/index.ts               # Pino factory
  test/
    setup.ts                      # PGlite global setup
    helpers.ts                    # createTestApp()
  routes/
    health.ts                     # GET /health
    health.test.ts
```

**Key details**:
- `package.json` scripts: `dev`, `build`, `start`, `db:start`, `db:stop`, `db:migrate`, `db:generate`, `test`, `test:watch`, `lint`, `lint:fix`
- `server.ts` accepts optional `db` param for test injection
- Error response shape: `{ statusCode, error, message, errorCode }`
- Docker Compose: Postgres 16, port 5432

---

## Phase 2: Users & Invoices (First Vertical Slice)

**Commit**: `feat: add users and invoices with schema, services, and tests`

**Endpoints**: `GET /api/self`, `GET /api/self/invoices`

**Schema**:
- `users`: id (uuid), companyName, email, createdAt
- `invoices`: id (uuid), userId (FK), amount (integer/oere), dueDate, status (enum: pending/paid/overdue), createdAt

**Module structure** (repeated pattern for all slices):
```
src/modules/users/
  user.routes.ts, user.controller.ts, user.service.ts
  user.serializer.ts, user.errors.ts (3XXX)
  user.controller.test.ts, user.service.test.ts, user.serializer.test.ts
src/modules/invoices/
  invoice.routes.ts, invoice.controller.ts, invoice.service.ts
  invoice.serializer.ts, invoice.errors.ts (4XXX)
  invoice.controller.test.ts, invoice.service.test.ts, invoice.serializer.test.ts
```

**Key details**:
- Auth via `x-user-id` header (simulates JWT/cookie) — userId derived from auth context, not URL params
- Protected routes scoped under a Fastify register block with auth hook
- Invoice service computes `hasDueInvoice` (for FE notification badge)
- `fastify-type-provider-zod` for auto OpenAPI generation
- Error classes group domain errors as static instances (e.g. `UserErrors.NOT_FOUND`)
- Shared `useTestDb()` helper handles all test lifecycle (beforeAll/afterEach/afterAll)
- Error codes: USER_NOT_FOUND=3001, INVOICES_USER_NOT_FOUND=4001

---

## Phase 3: Cards (Second Vertical Slice)

**Commit**: `feat: add cards endpoints with spending limit tracking`

**Endpoints**: `GET /api/self/card`, `PATCH /api/self/card/activate`

**Schema**:
- `cards`: id (uuid), userId (FK), lastFourDigits (varchar 4), status (enum: inactive/active/blocked), spendingLimit (integer/oere), currentSpend (integer/oere), expiryDate, createdAt

**Key details**:
- Serializer computes `remainingSpend` and formats as `"5 400/10 000 kr"`
- Amounts stored as oere (cents) to avoid floating point
- Activate logic: checks not found (1001), already active (1002), expired (1003)
- Never store full card numbers

---

## Phase 4: Transactions (Third Vertical Slice)

**Commit**: `feat: add paginated transactions endpoint`

**Endpoint**: `GET /api/self/card/transactions?limit=3&cursor=xxx`

**Schema**:
- `transactions`: id (uuid), cardId (FK), description, amount (integer/oere), currency (default SEK), date, category, createdAt

**Key details**:
- Cursor-based pagination (encode date+id, not offset-based)
- Response includes `remainingCount` (powers "54 more items" display)
- Default limit: 3, max: 50
- Pagination helpers in `src/lib/pagination/cursor.ts` with own tests
- Error codes: INVALID_CURSOR=2001

---

## Phase 5: Dashboard Aggregate Endpoint

**Commit**: `feat: add dashboard aggregate endpoint for home screen`

**Endpoint**: `GET /api/self/dashboard`

**Response** (maps 1:1 to FE mockup):
```json
{
  "user": { "id", "companyName" },
  "invoiceNotification": { "hasDueInvoice", "dueInvoiceCount" },
  "card": { "id", "lastFourDigits", "status", "remainingSpend": { "current", "limit", "currency", "formatted" } },
  "latestTransactions": { "items": [...], "remainingCount": 54 }
}
```

**Key details**:
- Reuses existing service functions — no query duplication
- Parallel queries via `Promise.all`
- Tolerant of missing data (no card = `card: null`)
- Demonstrates FE-driven API design thinking

---

## Phase 6: Seed Data & Documentation

**Commit**: `feat: add database seed script and project documentation`

- `src/lib/db/seed.ts`: realistic demo data matching the mockup (1 user, 1 card, 57 transactions, 2 invoices)
- `package.json`: add `db:seed` script
- `README.md`: setup instructions, architecture overview, error code table, design decisions, "given more time" section

---

## Phase 7 (Optional): Production Polish

**Commit**: `chore: add CORS, graceful shutdown, and CI workflow`

- CORS plugin, graceful SIGTERM handling
- Enhanced error handler (Zod validation errors → 400)
- `.github/workflows/ci.yml` (lint + test, no Docker needed thanks to PGlite)

---

## Key Dependencies

**Production**: `fastify`, `drizzle-orm`, `postgres`, `zod`, `pino`, `pino-pretty`, `@fastify/swagger`, `@scalar/fastify-api-reference`, `fastify-type-provider-zod`

**Dev**: `typescript`, `tsx`, `vitest`, `@biomejs/biome`, `drizzle-kit`, `@electric-sql/pglite`

## Verification

After each phase:
1. `npm run lint` passes
2. `npm test` passes
3. `npm run dev` → hit endpoints with curl or Scalar UI at `/reference`
4. Final demo: `npm run db:start && npm run db:migrate && npm run db:seed && npm run dev`

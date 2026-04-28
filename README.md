# Qred Case Study

A Node.js/TypeScript backend for Qred's mobile banking dashboard. Built with **Fastify**, **Drizzle ORM**, **PostgreSQL**, **Zod**, **Pino**, **Vitest**, **Biome**, and **Scalar** for API documentation.

The API powers a mobile dashboard that displays company info, invoice notifications, card details with spending limits, and paginated transactions.

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [Error Codes](#error-codes)
- [Scripts](#scripts)
- [Testing](#testing)

## Quick Start

**Prerequisites**: Node.js 22+, Docker

```bash
npm install
npm run db:start       # Start PostgreSQL via Docker Compose
npm run db:migrate     # Run Drizzle migrations
npm run db:seed        # Seed demo data (1 user, 1 card, 57 transactions, 3 invoices)
npm run dev            # Start dev server with hot reload
```

Interactive API docs are available at [http://localhost:3000/reference](http://localhost:3000/reference) (Scalar).

**Try it out:**

```bash
curl http://localhost:3000/api/self/dashboard \
  -H "x-user-id: cac45c3f-be23-429e-8ccf-3f3f4d45521a"
```

## API Endpoints

All `/api/self/*` routes require the `x-user-id` header (simulates authentication).

| Method  | Path                           | Description              |
| ------- | ------------------------------ | ------------------------ |
| `GET`   | `/health`                      | Health check             |
| `GET`   | `/api/self`                    | Current user profile     |
| `GET`   | `/api/self/invoices`           | User's invoices          |
| `GET`   | `/api/self/card`               | User's card details      |
| `PATCH` | `/api/self/card/activate`      | Activate an inactive card|
| `GET`   | `/api/self/card/transactions`  | Paginated transactions   |
| `GET`   | `/api/self/dashboard`          | Aggregate dashboard      |

**Transactions query params**: `limit` (default: 3, max: 50), `cursor` (base64url-encoded pagination cursor)

## Architecture

```
Request  ->  Route  ->  Controller  ->  Service  ->  Serializer  ->  Response
```

| Layer        | Responsibility                                                         |
| ------------ | ---------------------------------------------------------------------- |
| **Route**    | Defines the endpoint, attaches Zod schemas for validation and OpenAPI  |
| **Controller** | Extracts request data, calls the service, passes result to serializer |
| **Service**  | Business logic and database operations                                 |
| **Serializer** | Transforms DB data into the API response shape                       |

### Project Structure

```
src/
  index.ts                          # Entrypoint
  server.ts                         # App factory (accepts db via DI)
  config/env.ts                     # Zod-validated environment variables
  plugins/
    auth.ts                         # x-user-id header auth hook
    database.ts                     # DB plugin (Fastify DI)
    request-context.ts              # Request UUID + Pino child logger
    swagger.ts                      # @fastify/swagger + Scalar
  lib/
    db/client.ts                    # drizzle(postgres(...))
    db/seed.ts                      # Demo data seeder
    db/schema/                      # Drizzle table definitions
    errors/errors.ts                # AppError class + domain error objects
    errors/error-handler.ts         # Fastify error handler
    logger/index.ts                 # Pino configuration
    pagination/cursor.ts            # Cursor encode/decode helpers
    schemas/error.schema.ts         # Shared error response schema
  routes/                           # Route definitions
  controllers/                      # Request handlers
  services/                         # Business logic
  serializers/                      # Response transformers
  test/
    setup.ts                        # PGlite test DB lifecycle (useTestDb)
    helpers.ts                      # createTestApp() factory
```

### Dependency Injection

`createApp({ db })` accepts a database instance, making it easy to swap PostgreSQL for PGlite in tests without any mocking.

## Design Decisions

- **PGlite over SQLite for tests** — Drizzle ORM uses dialect-specific table builders (`pgTable` vs `sqliteTable`), so sharing schemas between Postgres and SQLite is impossible. PGlite runs real Postgres in-process with zero Docker dependency, using the exact same schema definitions.

- **Cursor-based pagination** — Stable under concurrent inserts and deletes, unlike offset-based pagination where pages shift as data changes. The cursor encodes `date|id` in base64url.

- **Amounts stored in oere (cents)** — All monetary values are integers (e.g., `540000` = 5,400.00 kr) to avoid floating-point arithmetic issues. The serializer formats them for display.

- **`x-user-id` header for auth** — Simulates JWT/cookie authentication. The user ID comes from the auth context, never from URL parameters. In production this would be replaced with proper token validation.

- **Dashboard aggregate endpoint** — A single `GET /api/self/dashboard` call returns everything the home screen needs (user, card, invoices, transactions), reducing frontend round-trips. Uses `Promise.all` for parallel queries.

- **Domain-scoped error codes** — 4-digit codes grouped by domain (1XXX cards, 2XXX transactions, 3XXX users, 4XXX invoices). The frontend can map errors by code instead of parsing status codes or messages.

- **Frozen error objects** — Domain errors are `Object.freeze`-d singleton instances (e.g., `CardErrors.NOT_FOUND`), keeping error definitions immutable and reusable across the codebase.

## Error Codes

| Code | Domain       | Description         |
| ---- | ------------ | ------------------- |
| 1001 | Cards        | Card not found      |
| 1002 | Cards        | Card already active |
| 1003 | Cards        | Card expired        |
| 1004 | Cards        | Card blocked        |
| 2001 | Transactions | Invalid cursor      |
| 3001 | Users        | User not found      |
| 3002 | Users        | Unauthorized        |
| 4001 | Invoices     | User not found      |

## Scripts

| Script          | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start dev server with hot reload (`tsx watch`)   |
| `npm run build` | Compile TypeScript                               |
| `npm start`     | Run compiled output (`node dist/index.js`)       |
| `npm run db:start` | Start PostgreSQL via Docker Compose           |
| `npm run db:stop`  | Stop PostgreSQL container                      |
| `npm run db:generate` | Generate Drizzle migrations                 |
| `npm run db:migrate`  | Run pending migrations                       |
| `npm run db:seed`     | Seed the database with demo data             |
| `npm test`            | Run all tests                                |
| `npm run test:watch`  | Run tests in watch mode                      |
| `npm run lint`        | Type-check + Biome lint                      |
| `npm run lint:fix`    | Auto-fix lint issues                         |

## Testing

Tests live next to the files they test (e.g., `card.service.ts` and `card.service.test.ts` in the same directory).

| Test type      | What it covers                      | DB            |
| -------------- | ----------------------------------- | ------------- |
| **Serializer** | Input/output transformation logic   | None          |
| **Service**    | Business logic + DB queries         | PGlite        |
| **Controller** | Request handling + response shape   | PGlite        |

```bash
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
```

No Docker is needed to run tests — PGlite runs an in-process Postgres instance using the same Drizzle schema as production.

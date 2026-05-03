# Backend Structure

This document describes the current backend workspace for Gym Tracker.

## Location

Backend code lives in:

```text
backend/
```

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- API framework: Express
- Database ORM: Prisma
- Database: PostgreSQL
- Validation: Zod
- Password hashing: bcryptjs
- Security middleware: helmet, cors

## Folder Layout

```text
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── schema.sql
├── scripts/
│   └── apply-schema.mjs
└── src/
    ├── db.ts
    ├── server.ts
    ├── lib/
    │   ├── calorie-engine.ts
    │   ├── date.ts
    │   ├── db.ts
    │   ├── onboarding-schema.ts
    │   └── token.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── error.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── body-metrics.routes.ts
    │   ├── dashboard.routes.ts
    │   ├── goals.routes.ts
    │   ├── nutrition.routes.ts
    │   └── workout.routes.ts
    └── types/
        └── express.d.ts
```

## Important Files

### `backend/src/server.ts`

Main Express server. It now wires global middleware and mounts route modules.

Responsibilities:

- Starts the API server.
- Enables JSON body parsing.
- Enables `helmet`.
- Enables CORS.
- Mounts auth, dashboard, workout, nutrition, body metrics, and goal routes.
- Handles validation errors and known database errors.

### `backend/src/middleware/auth.ts`

Bearer-token middleware.

Responsibilities:

- Reads `Authorization: Bearer <token>`.
- Hashes the token with SHA-256.
- Looks up a valid non-revoked session.
- Sets `req.userId` and `req.user` for route handlers.

### `backend/src/routes/`

Route modules grouped by feature:

- `auth.routes.ts` - register, login, me, logout, rate limiting
- `dashboard.routes.ts` - authenticated dashboard summary
- `workout.routes.ts` - workouts, exercises, sets
- `nutrition.routes.ts` - nutrition logs
- `body-metrics.routes.ts` - body measurements
- `goals.routes.ts` - goals

### `backend/src/db.ts`

Creates and exports the Prisma client:

```ts
export const prisma = new PrismaClient();
```

All database queries should go through this shared client.

### `backend/prisma/schema.prisma`

Prisma schema used by the backend.

Contains:

- Models
- Relations
- Indexes
- Enum definitions
- PostgreSQL datasource config

### `backend/prisma/schema.sql`

Raw SQL schema used by `scripts/apply-schema.mjs`.

This was added because the local machine initially did not have `psql` or a normal npm setup available. It can apply the database schema directly to Railway PostgreSQL.

### `backend/scripts/apply-schema.mjs`

Custom schema deployment script.

Responsibilities:

- Reads `DATABASE_URL` from the environment.
- Connects to PostgreSQL over TLS.
- Applies `backend/prisma/schema.sql`.

Use this only when Prisma migration tooling is unavailable.

## Environment Variables

Create `backend/.env` from:

```text
backend/.env.example
```

Expected variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=4000
APP_ORIGIN="http://localhost:8081"
```

Do not commit `.env`.

## API Endpoints

### Health

```http
GET /health
```

Returns server status.

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

Register creates:

- User
- OnboardingProfile
- Initial BodyMetric
- Initial Goal
- Session token

Login verifies:

- Email
- Password hash
- Deleted user state

### Dashboard

```http
GET /api/dashboard/summary
```

Returns real database values for:

- Calories consumed today
- Protein consumed today
- Latest weight
- Weekly workout count
- Today's workout if logged

### Workouts

```http
POST /api/workouts
GET /api/workouts/today
POST /api/workouts/:workoutId/exercises
POST /api/workouts/exercises/:exerciseId/sets
```

### Nutrition

```http
GET /api/nutrition/today
POST /api/nutrition
```

### Body Metrics

```http
POST /api/body-metrics
```

### Goals

```http
GET /api/goals
```

All routes above, except register/login/health, require:

```http
Authorization: Bearer <token>
```

## Current Auth Behavior

Registration and login return:

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  }
}
```

Session tokens are hashed before being stored in the database.

Important current behavior:

- Protected API routes derive `userId` from the session token.
- Client-provided `userId` is no longer accepted for dashboard, workout, nutrition, body metric, or goal routes.

## Next Backend Tasks

Recommended next steps:

- Add refresh token endpoint.
- Add route tests for auth and ownership boundaries.
- Add Prisma migrations and stop maintaining raw SQL manually.
- Add pagination for history endpoints.
- Add stricter request logging and audit log writes.

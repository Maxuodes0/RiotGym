# Backend

Backend workspace for Gym Tracker.

## Setup

Create `.env` from `.env.example` and paste Railway's `DATABASE_URL`.

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

Suggested API modules:

- Auth and sessions
- Workouts
- Nutrition logs
- Body metrics
- Goals
- Dashboard summary

Suggested endpoints:

- `GET /api/dashboard/summary`
- `GET /api/workouts/today`
- `POST /api/workouts`
- `GET /api/nutrition/today`
- `POST /api/nutrition/meals`
- `GET /api/progress`
- `GET /api/goals`

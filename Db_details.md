# Database Details

Gym Tracker uses PostgreSQL through Prisma.

## Provider

Current database provider:

```text
Railway PostgreSQL
```

Do not store database credentials in the repository.

Use:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

## Schema Sources

Prisma schema:

```text
backend/prisma/schema.prisma
```

Raw SQL schema:

```text
backend/prisma/schema.sql
```

## Tables

### `User`

Stores account identity.

Important fields:

- `id` - UUID primary key
- `email` - unique login email
- `passwordHash` - bcrypt password hash
- `name` - display name
- `failedLogins` - failed login counter
- `lockedUntil` - future lockout support
- `deletedAt` - soft delete marker
- `createdAt`
- `updatedAt`

Relations:

- One user has one onboarding profile.
- One user has many sessions.
- One user has many workouts.
- One user has many nutrition logs.
- One user has many body metrics.
- One user has many goals.

### `OnboardingProfile`

Stores account setup data from onboarding.

Fields from the onboarding plan:

- `gender`
- `age`
- `heightCm`
- `currentWeightKg`
- `bodyFatPercent`
- `goal`
- `targetWeightKg`
- `weeklyChangeKg`
- `deadline`
- `activityLevel`
- `workoutDaysPerWeek`
- `equipment`
- `experienceLevel`
- `limitations`

Purpose:

- Calculate BMR/TDEE.
- Calculate calorie target.
- Calculate protein target.
- Create initial goals.
- Create initial body metric.

Relation:

- One-to-one with `User`.

### `Session`

Stores login sessions.

Important fields:

- `id`
- `userId`
- `tokenHash`
- `ipAddress`
- `userAgent`
- `expiresAt`
- `revokedAt`
- `createdAt`

Security note:

- Raw tokens are not stored.
- Only SHA-256 token hashes are stored.

Indexes:

- `userId`
- `expiresAt`

### `Goal`

Stores user goals and calculated targets.

Important fields:

- `targetWeight`
- `targetCalories`
- `targetProtein`
- `weeklyWorkouts`
- `deletedAt`

Created during registration from onboarding data.

Index:

- `userId`

### `Workout`

Stores workout sessions.

Important fields:

- `userId`
- `date`
- `dayType`
- `notes`
- `duration`
- `deletedAt`

Relations:

- A workout has many exercises.

Index:

- `(userId, date)`

### `Exercise`

Stores exercises inside a workout.

Important fields:

- `workoutId`
- `name`
- `muscleGroup`
- `orderIndex`
- `createdAt`
- `updatedAt`

Relations:

- An exercise has many sets.

Index:

- `workoutId`

### `ExerciseSet`

Stores individual sets.

Important fields:

- `exerciseId`
- `setNumber`
- `reps`
- `weight`
- `rpe`
- `completed`
- `createdAt`
- `updatedAt`

Constraints:

- `reps > 0`
- `weight >= 0`
- `rpe IS NULL OR rpe BETWEEN 1 AND 10`

Index:

- `exerciseId`

### `BodyMetric`

Stores body progress measurements.

Important fields:

- `userId`
- `date`
- `weight`
- `bodyFat`
- `waist`
- `chest`
- `source`

`source` enum:

- `manual`
- `smart_scale`
- `import`

Index:

- `(userId, date)`

Unique:

- `(userId, date)` to keep one body metric entry per user per day.

API behavior:

- `POST /api/body-metrics` uses upsert, so submitting a metric for the same date updates the existing row.

### `NutritionLog`

Stores meal or nutrition entries.

Important fields:

- `userId`
- `date`
- `mealName`
- `calories`
- `protein`
- `carbs`
- `fats`
- `waterMl`

Index:

- `(userId, date)`

### `AuditLog`

Stores future audit trail events.

Important fields:

- `userId`
- `action`
- `entity`
- `entityId`
- `metadata`
- `ipAddress`
- `createdAt`

Indexes:

- `userId`
- `(entity, entityId)`

## Relationships Summary

```text
User 1--1 OnboardingProfile
User 1--N Session
User 1--N Goal
User 1--N Workout
Workout 1--N Exercise
Exercise 1--N ExerciseSet
User 1--N BodyMetric
User 1--N NutritionLog
```

## Registration Database Flow

When `POST /api/auth/register` succeeds:

1. Hash password with bcrypt cost 12.
2. Create `User`.
3. Create `OnboardingProfile`.
4. Calculate targets from onboarding:
   - Calories from Mifflin-St Jeor BMR and activity multiplier.
   - Protein as roughly `currentWeightKg * 1.8`.
5. Create initial `BodyMetric`.
6. Create initial `Goal`.
7. Create a `Session`.
8. Return session token and public user object.

## Current Limitations

- No row-level security policies are defined in Railway PostgreSQL yet.
- No Prisma migration history has been committed yet.
- Raw SQL schema and Prisma schema must be kept in sync manually until migrations are adopted.
- Refresh token flow is not implemented yet.
- Session tokens are persisted on mobile with SecureStore, but token refresh/session expiry UX still needs polish.

## Recommended Next Database Work

- Add Prisma migrations with `prisma migrate dev`.
- Add unique constraints where needed, for example one body metric per user per date.
- Add seed data for local development only.
- Add RLS or move strict isolation fully into backend authorization.

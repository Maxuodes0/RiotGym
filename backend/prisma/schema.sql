CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BodyMetricSource') THEN
    CREATE TYPE "BodyMetricSource" AS ENUM ('manual', 'smart_scale', 'import');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  "name" text NOT NULL,
  "failedLogins" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamp(3),
  "deletedAt" timestamp(3),
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "tokenHash" text NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "expiresAt" timestamp(3) NOT NULL,
  "revokedAt" timestamp(3),
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OnboardingProfile" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "gender" text NOT NULL,
  "age" integer NOT NULL,
  "heightCm" numeric(6,2) NOT NULL,
  "currentWeightKg" numeric(6,2) NOT NULL,
  "bodyFatPercent" numeric(5,2),
  "goal" text NOT NULL,
  "targetWeightKg" numeric(6,2) NOT NULL,
  "weeklyChangeKg" numeric(4,2) NOT NULL,
  "deadline" date,
  "activityLevel" text NOT NULL,
  "workoutDaysPerWeek" integer NOT NULL,
  "equipment" text NOT NULL,
  "experienceLevel" text NOT NULL,
  "limitations" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Goal" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "targetWeight" numeric(6,2),
  "targetCalories" integer,
  "targetProtein" integer,
  "weeklyWorkouts" integer,
  "deletedAt" timestamp(3),
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Workout" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "dayType" text NOT NULL,
  "notes" text,
  "duration" integer,
  "deletedAt" timestamp(3),
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Exercise" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workoutId" uuid NOT NULL REFERENCES "Workout"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "muscleGroup" text NOT NULL,
  "orderIndex" integer NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ExerciseSet" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "exerciseId" uuid NOT NULL REFERENCES "Exercise"("id") ON DELETE CASCADE,
  "setNumber" integer NOT NULL,
  "reps" integer NOT NULL,
  "weight" numeric(6,2) NOT NULL,
  "rpe" integer,
  "completed" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BodyMetric" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "weight" numeric(6,2),
  "bodyFat" numeric(5,2),
  "waist" numeric(6,2),
  "chest" numeric(6,2),
  "source" "BodyMetricSource" NOT NULL DEFAULT 'manual',
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "NutritionLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "mealName" text NOT NULL,
  "calories" integer NOT NULL,
  "protein" numeric(6,2) NOT NULL,
  "carbs" numeric(6,2) NOT NULL,
  "fats" numeric(6,2) NOT NULL,
  "waterMl" integer,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid,
  "action" text NOT NULL,
  "entity" text NOT NULL,
  "entityId" text,
  "metadata" jsonb,
  "ipAddress" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON "Goal"("userId");
CREATE INDEX IF NOT EXISTS "Workout_userId_date_idx" ON "Workout"("userId", "date");
CREATE INDEX IF NOT EXISTS "Exercise_workoutId_idx" ON "Exercise"("workoutId");
CREATE INDEX IF NOT EXISTS "ExerciseSet_exerciseId_idx" ON "ExerciseSet"("exerciseId");
CREATE INDEX IF NOT EXISTS "BodyMetric_userId_date_idx" ON "BodyMetric"("userId", "date");
CREATE INDEX IF NOT EXISTS "NutritionLog_userId_date_idx" ON "NutritionLog"("userId", "date");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExerciseSet" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExerciseSet" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BodyMetric_userId_date_unique'
  ) THEN
    ALTER TABLE "BodyMetric"
      ADD CONSTRAINT "BodyMetric_userId_date_unique" UNIQUE ("userId", "date");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ExerciseSet_reps_positive_check'
  ) THEN
    ALTER TABLE "ExerciseSet"
      ADD CONSTRAINT "ExerciseSet_reps_positive_check" CHECK ("reps" > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ExerciseSet_weight_nonnegative_check'
  ) THEN
    ALTER TABLE "ExerciseSet"
      ADD CONSTRAINT "ExerciseSet_weight_nonnegative_check" CHECK ("weight" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ExerciseSet_rpe_range_check'
  ) THEN
    ALTER TABLE "ExerciseSet"
      ADD CONSTRAINT "ExerciseSet_rpe_range_check" CHECK ("rpe" IS NULL OR "rpe" BETWEEN 1 AND 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Workout_date_reasonable_check'
  ) THEN
    ALTER TABLE "Workout"
      ADD CONSTRAINT "Workout_date_reasonable_check" CHECK ("date" <= CURRENT_DATE + INTERVAL '1 day');
  END IF;
END $$;

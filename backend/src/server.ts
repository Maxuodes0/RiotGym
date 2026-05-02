import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import { prisma } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const appOrigin = process.env.APP_ORIGIN ?? "*";

app.use(helmet());
app.use(cors({ origin: appOrigin === "*" ? true : appOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gym-tracker-backend" });
});

const onboardingSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(13).max(100),
  heightCm: z.number().min(100).max(240),
  currentWeightKg: z.number().min(30).max(300),
  bodyFatPercent: z.number().min(3).max(70).optional().nullable(),
  goal: z.enum(["lose", "maintain", "gain"]),
  targetWeightKg: z.number().min(30).max(300),
  weeklyChangeKg: z.number().min(0).max(1.5),
  deadline: z.coerce.date().optional().nullable(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workoutDaysPerWeek: z.number().int().min(1).max(7),
  equipment: z.enum(["gym", "home", "none"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  limitations: z.string().max(500).optional().nullable()
});

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  onboarding: onboardingSchema
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const targets = calculateTargets(input.onboarding);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        onboarding: { create: normalizeOnboarding(input.onboarding) },
        bodyMetrics: {
          create: {
            date: todayDate(),
            weight: input.onboarding.currentWeightKg,
            bodyFat: input.onboarding.bodyFatPercent ?? undefined
          }
        },
        goals: {
          create: {
            targetWeight: input.onboarding.targetWeightKg,
            targetCalories: targets.calories,
            targetProtein: targets.protein,
            weeklyWorkouts: input.onboarding.workoutDaysPerWeek
          }
        }
      },
      include: { onboarding: true, goals: true }
    });

    const token = await createSession(user.id, req);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email }, include: { onboarding: true, goals: true } });

    if (!user || user.deletedAt) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLogins: { increment: 1 } } });
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    const token = await createSession(user.id, req);
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/summary", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.query.userId);
    const today = todayDate();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const [latestGoal, latestMetric, todayMeals, weekWorkouts, todayWorkout] = await Promise.all([
      prisma.goal.findFirst({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
      prisma.bodyMetric.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.nutritionLog.findMany({ where: { userId, date: today } }),
      prisma.workout.count({ where: { userId, deletedAt: null, date: { gte: weekStart, lte: today } } }),
      prisma.workout.findFirst({
        where: { userId, deletedAt: null, date: today },
        include: { exercises: { include: { sets: true }, orderBy: { orderIndex: "asc" } } }
      })
    ]);

    const calories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const protein = todayMeals.reduce((sum, meal) => sum + Number(meal.protein), 0);
    const targetCalories = latestGoal?.targetCalories ?? null;
    const targetProtein = latestGoal?.targetProtein ?? null;

    res.json({
      calories: { value: calories, target: targetCalories },
      protein: { value: protein, target: targetProtein },
      weight: latestMetric?.weight ? Number(latestMetric.weight) : null,
      workouts: { value: weekWorkouts, target: latestGoal?.weeklyWorkouts ?? null },
      todayWorkout: todayWorkout ?? null,
      hasRealData: true
    });
  } catch (error) {
    next(error);
  }
});

const workoutSchema = z.object({
  userId: z.string().uuid(),
  date: z.coerce.date(),
  dayType: z.string().min(1),
  notes: z.string().optional(),
  duration: z.number().int().positive().optional()
});

app.post("/api/workouts", async (req, res, next) => {
  try {
    const input = workoutSchema.parse(req.body);
    const workout = await prisma.workout.create({ data: input });
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
});

app.get("/api/workouts/today", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.query.userId);
    const today = todayDate();

    const workouts = await prisma.workout.findMany({
      where: { userId, date: today, deletedAt: null },
      include: {
        exercises: {
          include: { sets: true },
          orderBy: { orderIndex: "asc" }
        }
      }
    });

    res.json(workouts);
  } catch (error) {
    next(error);
  }
});

app.get("/api/nutrition/today", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.query.userId);
    const meals = await prisma.nutritionLog.findMany({ where: { userId, date: todayDate() }, orderBy: { createdAt: "asc" } });
    res.json(meals);
  } catch (error) {
    next(error);
  }
});

app.get("/api/goals", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.query.userId);
    const goals = await prisma.goal.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Validation failed", issues: error.issues });
    return;
  }

  if (isUniqueConstraintError(error)) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Gym Tracker API running on http://localhost:${port}`);
});

function todayDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeOnboarding(onboarding: z.infer<typeof onboardingSchema>) {
  return {
    ...onboarding,
    bodyFatPercent: onboarding.bodyFatPercent ?? undefined,
    deadline: onboarding.deadline ?? undefined,
    limitations: onboarding.limitations ?? undefined
  };
}

async function createSession(userId: string, req: express.Request) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    }
  });

  return token;
}

function publicUser(user: { id: string; email: string; name: string; onboarding?: unknown; goals?: unknown }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    onboarding: user.onboarding,
    goals: user.goals
  };
}

function calculateTargets(onboarding: z.infer<typeof onboardingSchema>) {
  const bmr =
    onboarding.gender === "male"
      ? 10 * onboarding.currentWeightKg + 6.25 * onboarding.heightCm - 5 * onboarding.age + 5
      : 10 * onboarding.currentWeightKg + 6.25 * onboarding.heightCm - 5 * onboarding.age - 161;

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }[onboarding.activityLevel];

  const tdee = bmr * activityMultiplier;
  const weeklyOffset = onboarding.weeklyChangeKg * 7700 / 7;
  const calories =
    onboarding.goal === "lose" ? tdee - weeklyOffset : onboarding.goal === "gain" ? tdee + weeklyOffset : tdee;

  return {
    calories: Math.max(1200, Math.round(calories)),
    protein: Math.round(onboarding.currentWeightKg * 1.8)
  };
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

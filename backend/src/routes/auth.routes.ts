import bcrypt from "bcryptjs";
import { Request, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { calculateTargets } from "../lib/calorie-engine.js";
import { prisma } from "../lib/db.js";
import { todayDate } from "../lib/date.js";
import { normalizeOnboarding, onboardingSchema } from "../lib/onboarding-schema.js";
import { createRawToken, hashToken } from "../lib/token.js";
import { extractBearerToken, requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Try again later." }
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

authRouter.use(authLimiter);

authRouter.post("/register", async (req, res, next) => {
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

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { onboarding: true, goals: true }
    });

    if (!user || user.deletedAt) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      res.status(423).json({ error: "Account locked. Try again later." });
      return;
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const nextFailedLogins = user.failedLogins + 1;
      const lockedUntil = nextFailedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: nextFailedLogins,
          lockedUntil
        }
      });

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

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      await prisma.session.updateMany({
        where: {
          tokenHash: hashToken(token),
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

async function createSession(userId: string, req: Request) {
  const token = createRawToken();
  const tokenHash = hashToken(token);
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

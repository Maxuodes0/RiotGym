import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { todayDate } from "../lib/date.js";
import { requireAuth } from "../middleware/auth.js";

export const workoutRouter = Router();

const workoutSchema = z.object({
  date: z.coerce.date(),
  dayType: z.string().min(1),
  notes: z.string().optional(),
  duration: z.number().int().positive().optional()
});

const exerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.string().min(1),
  orderIndex: z.number().int().min(0)
});

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  rpe: z.number().int().min(1).max(10).optional(),
  completed: z.boolean().optional()
});

workoutRouter.use(requireAuth);

workoutRouter.post("/", async (req, res, next) => {
  try {
    const input = workoutSchema.parse(req.body);
    const workout = await prisma.workout.create({
      data: {
        ...input,
        userId: req.userId!
      }
    });
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
});

workoutRouter.get("/today", async (req, res, next) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId!, date: todayDate(), deletedAt: null },
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

workoutRouter.post("/:workoutId/exercises", async (req, res, next) => {
  try {
    const input = exerciseSchema.parse(req.body);
    const workout = await prisma.workout.findFirst({
      where: { id: req.params.workoutId, userId: req.userId!, deletedAt: null }
    });

    if (!workout) {
      res.status(404).json({ error: "Workout not found" });
      return;
    }

    const exercise = await prisma.exercise.create({
      data: {
        ...input,
        workoutId: workout.id
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

workoutRouter.post("/exercises/:exerciseId/sets", async (req, res, next) => {
  try {
    const input = setSchema.parse(req.body);
    const exercise = await prisma.exercise.findFirst({
      where: {
        id: req.params.exerciseId,
        workout: {
          userId: req.userId!,
          deletedAt: null
        }
      }
    });

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    const set = await prisma.exerciseSet.create({
      data: {
        ...input,
        exerciseId: exercise.id
      }
    });

    res.status(201).json(set);
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { todayDate } from "../lib/date.js";
import { requireAuth } from "../middleware/auth.js";

export const nutritionRouter = Router();

const nutritionSchema = z.object({
  date: z.coerce.date().optional(),
  mealName: z.string().min(1).max(80),
  calories: z.number().int().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  waterMl: z.number().int().min(0).optional()
});

nutritionRouter.use(requireAuth);

nutritionRouter.get("/today", async (req, res, next) => {
  try {
    const meals = await prisma.nutritionLog.findMany({
      where: { userId: req.userId!, date: todayDate() },
      orderBy: { createdAt: "asc" }
    });
    res.json(meals);
  } catch (error) {
    next(error);
  }
});

nutritionRouter.post("/", async (req, res, next) => {
  try {
    const input = nutritionSchema.parse(req.body);
    const meal = await prisma.nutritionLog.create({
      data: {
        ...input,
        date: input.date ?? todayDate(),
        userId: req.userId!
      }
    });
    res.status(201).json(meal);
  } catch (error) {
    next(error);
  }
});

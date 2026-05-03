import { Router } from "express";
import { prisma } from "../lib/db.js";
import { todayDate } from "../lib/date.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId!;
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

    const calories = todayMeals.reduce((sum: number, meal: { calories: number }) => sum + meal.calories, 0);
    const protein = todayMeals.reduce((sum: number, meal: { protein: unknown }) => sum + Number(meal.protein), 0);

    res.json({
      calories: { value: calories, target: latestGoal?.targetCalories ?? null },
      protein: { value: protein, target: latestGoal?.targetProtein ?? null },
      weight: latestMetric?.weight ? Number(latestMetric.weight) : null,
      workouts: { value: weekWorkouts, target: latestGoal?.weeklyWorkouts ?? null },
      todayWorkout: todayWorkout ?? null,
      hasRealData: true
    });
  } catch (error) {
    next(error);
  }
});

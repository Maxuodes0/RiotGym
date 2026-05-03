import { Router } from "express";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

export const goalsRouter = Router();

goalsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId!, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

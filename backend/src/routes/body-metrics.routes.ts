import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { todayDate } from "../lib/date.js";
import { requireAuth } from "../middleware/auth.js";

export const bodyMetricsRouter = Router();

const bodyMetricSchema = z.object({
  date: z.coerce.date().optional(),
  weight: z.number().min(30).max(300).optional(),
  bodyFat: z.number().min(3).max(70).optional(),
  waist: z.number().min(20).max(250).optional(),
  chest: z.number().min(20).max(250).optional(),
  source: z.enum(["manual", "smart_scale", "import"]).optional()
});

bodyMetricsRouter.use(requireAuth);

bodyMetricsRouter.post("/", async (req, res, next) => {
  try {
    const input = bodyMetricSchema.parse(req.body);
    const metric = await prisma.bodyMetric.create({
      data: {
        ...input,
        date: input.date ?? todayDate(),
        userId: req.userId!
      }
    });
    res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
});

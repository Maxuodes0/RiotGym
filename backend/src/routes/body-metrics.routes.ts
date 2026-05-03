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
    const date = input.date ?? todayDate();
    const metric = await prisma.bodyMetric.upsert({
      where: {
        userId_date: {
          userId: req.userId!,
          date
        }
      },
      create: {
        ...input,
        date,
        userId: req.userId!
      },
      update: {
        weight: input.weight,
        bodyFat: input.bodyFat,
        waist: input.waist,
        chest: input.chest,
        source: input.source
      }
    });
    res.status(200).json(metric);
  } catch (error) {
    next(error);
  }
});

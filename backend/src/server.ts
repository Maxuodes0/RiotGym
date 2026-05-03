import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { bodyMetricsRouter } from "./routes/body-metrics.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { goalsRouter } from "./routes/goals.routes.js";
import { nutritionRouter } from "./routes/nutrition.routes.js";
import { workoutRouter } from "./routes/workout.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const appOrigin = process.env.APP_ORIGIN ?? "*";

app.use(helmet());
app.use(cors({ origin: appOrigin === "*" ? true : appOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gym-tracker-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/body-metrics", bodyMetricsRouter);
app.use("/api/goals", goalsRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Gym Tracker API running on http://localhost:${port}`);
});

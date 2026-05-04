import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Validation failed", issues: error.issues });
    return;
  }

  if (isUniqueConstraintError(error)) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  if (isDatabaseConnectionError(error)) {
    console.error(error);
    res.status(503).json({ error: "Database is unreachable. Check Railway public networking settings." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function isDatabaseConnectionError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const maybeError = error as { code?: unknown; name?: unknown; message?: unknown };
  const message = typeof maybeError.message === "string" ? maybeError.message : "";

  return (
    maybeError.code === "P1001" ||
    maybeError.name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server")
  );
}

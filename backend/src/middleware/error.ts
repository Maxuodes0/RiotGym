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

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

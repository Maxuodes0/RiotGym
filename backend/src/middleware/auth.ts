import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { hashToken } from "../lib/token.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tokenHash = hashToken(token);
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { deletedAt: null }
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!session) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }

    req.userId = session.userId;
    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}

export function extractBearerToken(header: string | undefined) {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length ? token : null;
}

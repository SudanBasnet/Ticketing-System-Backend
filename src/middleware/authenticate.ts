import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

type AccessPayload = {
  sub: string;
  email: string;
  role: "user" | "agent" | "admin" | "super_admin";
  tokenVersion?: number;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
  }

  try {
    const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET) as AccessPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tokenVersion: payload.tokenVersion
    };
    next();
  } catch {
    throw new AppError(401, "Invalid or expired access token", "INVALID_ACCESS_TOKEN");
  }
};

export const authorize =
  (...roles: Array<"user" | "agent" | "admin" | "super_admin">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to perform this action", "FORBIDDEN");
    }
    next();
  };

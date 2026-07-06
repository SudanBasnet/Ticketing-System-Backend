import type { NextFunction, Request, Response } from "express";

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith("$") && !key.includes("."))
        .map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    );
  }

  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.params) {
    Object.assign(req.params, sanitizeValue(req.params));
  }

  if (req.query) {
    Object.assign(req.query, sanitizeValue(req.query));
  }

  next();
};

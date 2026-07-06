import type { Response } from "express";

type Meta = Record<string, unknown>;

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data: unknown = null,
  meta?: Meta
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
};

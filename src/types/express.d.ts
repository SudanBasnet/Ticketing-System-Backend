import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        email: string;
        role: "user" | "agent" | "admin" | "super_admin";
        tokenVersion?: number;
      };
    }
  }
}

export type ObjectId = Types.ObjectId;

import { z } from "zod";

export const objectIdParamSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id")
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatarUrl: z.string().url().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

export const adminListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(["user", "agent", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "disabled", "deleted"]).optional(),
  search: z.string().trim().optional()
});

export const updateRoleSchema = z.object({
  role: z.enum(["user", "agent", "admin"])
});

export const updateStatusSchema = z.object({
  status: z.enum(["active", "disabled"])
});

import { z } from "zod";

export const incidentIdParamSchema = z.object({
  incidentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid incident id")
});

export const createIncidentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().trim().max(80).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  assignmentGroup: z.string().trim().max(100).optional(),
  affectedCi: z.string().regex(/^[a-f\d]{24}$/i).optional()
});

export const updateIncidentSchema = createIncidentSchema.partial().extend({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  assignedTo: z.string().regex(/^[a-f\d]{24}$/i, "Invalid assigned user id").nullable().optional(),
  slaStatus: z.enum(["on_track", "at_risk", "breached", "met"]).optional(),
  resolutionNotes: z.string().trim().max(3000).optional()
});

export const listIncidentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  createdBy: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["createdAt", "-createdAt", "lastActivityAt", "-lastActivityAt", "priority", "-priority"]).default("-lastActivityAt")
});

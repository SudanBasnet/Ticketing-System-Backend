import { z } from "zod";
const recordType = z.enum(["request", "problem", "change", "ci", "knowledge", "activity", "survey"]);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const typeParamSchema = z.object({ type: recordType });
export const recordParamSchema = z.object({ type: recordType, recordId: objectId });
export const listRecordQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    status: z.string().trim().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    search: z.string().trim().max(100).optional(),
    sort: z.string().default("-updatedAt"),
});
export const createRecordSchema = z.object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().max(6000).optional(),
    status: z.string().trim().min(2).max(60).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.string().trim().max(100).optional(),
    owner: objectId.optional(), requestedBy: objectId.optional(), approver: objectId.optional(),
    approvalStatus: z.enum(["not_required", "pending", "approved", "rejected"]).optional(),
    dueAt: z.coerce.date().optional(), risk: z.enum(["low", "medium", "high", "critical"]).optional(),
    impact: z.string().max(2000).optional(), implementationPlan: z.string().max(4000).optional(),
    testPlan: z.string().max(4000).optional(), rollbackPlan: z.string().max(4000).optional(),
    rootCause: z.string().max(4000).optional(), workaround: z.string().max(4000).optional(),
    knownError: z.boolean().optional(), ciType: z.string().max(80).optional(), environment: z.string().max(80).optional(),
    location: z.string().max(120).optional(), serialNumber: z.string().max(120).optional(), lifecycle: z.string().max(80).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(), relatedIncidents: z.array(objectId).optional(),
    relatedRecords: z.array(objectId).optional(), metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRecordSchema = createRecordSchema.partial();

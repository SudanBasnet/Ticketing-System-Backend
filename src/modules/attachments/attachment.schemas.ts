import { z } from "zod";

export const attachmentParamsSchema = z.object({
  incidentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid incident id"),
  attachmentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid attachment id").optional()
});

import { z } from "zod";

export const createWorkNoteSchema = z.object({
  note: z.string().trim().min(1).max(3000),
  isInternal: z.boolean().default(false),
});

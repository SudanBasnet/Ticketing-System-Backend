import mongoose, { Schema } from "mongoose";

export type IncidentStatus = "open" | "in_progress" | "resolved" | "closed";
export type IncidentPriority = "low" | "medium" | "high" | "urgent";

const incidentSchema = new Schema(
  {
    number: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", index: true },
    category: { type: String, trim: true, index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    attachmentCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

incidentSchema.index({ title: "text", description: "text", tags: "text", number: "text" });

export const IncidentModel = mongoose.model("Incident", incidentSchema);

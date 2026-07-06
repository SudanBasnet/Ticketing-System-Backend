import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryResourceType: { type: String, enum: ["image", "raw"], default: "image" }
  },
  { timestamps: true }
);

export const AttachmentModel = mongoose.model("Attachment", attachmentSchema);

import mongoose, { Schema } from "mongoose";
const workNoteSchema = new Schema({
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true, trim: true, maxlength: 3000 },
    isInternal: { type: Boolean, default: false, index: true },
}, { timestamps: true });
export const WorkNoteModel = mongoose.model("WorkNote", workNoteSchema);

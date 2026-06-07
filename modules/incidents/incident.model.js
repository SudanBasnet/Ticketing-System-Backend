import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    description: String,

    priority: {
      type: String,
      default: "Low",
    },

    urgency: {
      type: String,
      default: "Low",
    },

    status: {
      type: String,
      default: "Open",
    },

    assignedTo: {
      type: String,
    },

    createdBy: {
      type: String,
    },

    sla: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Incident", incidentSchema);

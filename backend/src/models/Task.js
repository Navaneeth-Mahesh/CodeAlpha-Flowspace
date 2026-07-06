import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: { type: mongoose.Schema.Types.Mixed },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: [true, "Task title is required"], trim: true, maxlength: 200 },
    description: { type: String, default: "" },
    status: { type: String, required: true, default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    labels: { type: [String], default: [] },
    dueDate: { type: Date },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    checklist: { type: [checklistItemSchema], default: [] },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    archived: { type: Boolean, default: false },
    activity: { type: [activitySchema], default: [] },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ project: 1, archived: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model("Task", taskSchema);

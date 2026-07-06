import mongoose from "mongoose";

const DEFAULT_COLUMNS = [
  { id: "backlog", name: "Backlog", order: 0 },
  { id: "todo", name: "To Do", order: 1 },
  { id: "in_progress", name: "In Progress", order: 2 },
  { id: "in_review", name: "In Review", order: 3 },
  { id: "done", name: "Done", order: 4 },
];

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "member", "guest"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pendingInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["admin", "manager", "member", "guest"], default: "member" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const columnSchema = new mongoose.Schema(
  { id: String, name: String, order: Number },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Project name is required"], trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    color: { type: String, default: "#5B8DEF" },
    icon: { type: String, default: "🗂️" },
    visibility: { type: String, enum: ["private", "team", "public"], default: "private" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
    pendingInvites: { type: [pendingInviteSchema], default: [] },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    columns: { type: [columnSchema], default: DEFAULT_COLUMNS },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, archived: 1 });
projectSchema.index({ "members.user": 1 });

export { DEFAULT_COLUMNS };
export default mongoose.model("Project", projectSchema);

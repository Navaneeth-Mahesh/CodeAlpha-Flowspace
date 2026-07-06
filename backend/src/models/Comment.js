import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 3000 },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: { type: [reactionSchema], default: [] },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);

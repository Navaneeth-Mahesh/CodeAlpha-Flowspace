import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { getMembership } from "../utils/permissions.js";
import { notify } from "../utils/notify.js";

const AUTHOR_POPULATE = { path: "author", select: "name avatarInitials avatarColor" };

// @desc  List comments for a task
// @route GET /api/tasks/:taskId/comments
export const getComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const project = await Project.findById(task.project);
  if (!getMembership(project, req.user._id)) {
    res.status(403);
    throw new Error("You don't have access to this task");
  }
  const comments = await Comment.find({ task: task._id }).populate(AUTHOR_POPULATE).sort({ createdAt: 1 });
  res.json({ comments });
});

// @desc  Add a comment (supports @mentions by user id)
// @route POST /api/tasks/:taskId/comments
export const createComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const project = await Project.findById(task.project);
  if (!getMembership(project, req.user._id)) {
    res.status(403);
    throw new Error("You don't have access to this task");
  }
  const { content, mentions = [] } = req.body;
  if (!content?.trim()) {
    res.status(400);
    throw new Error("Comment can't be empty");
  }

  const comment = await Comment.create({
    task: task._id,
    project: project._id,
    author: req.user._id,
    content,
    mentions,
  });

  const io = req.app.get("io");

  // Notify assignees (comment_added) except the author
  for (const userId of task.assignees) {
    await notify(io, {
      recipient: userId,
      actor: req.user._id,
      type: "comment_added",
      message: `${req.user.name} commented on "${task.title}"`,
      project: project._id,
      task: task._id,
    });
  }
  // Notify explicit @mentions
  for (const userId of mentions) {
    await notify(io, {
      recipient: userId,
      actor: req.user._id,
      type: "mention",
      message: `${req.user.name} mentioned you on "${task.title}"`,
      project: project._id,
      task: task._id,
    });
  }

  const populated = await comment.populate(AUTHOR_POPULATE);
  if (io) io.to(`project:${project._id}`).emit("comment:new", populated);
  res.status(201).json({ comment: populated });
});

// @desc  Edit a comment (author only)
// @route PATCH /api/comments/:id
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  if (String(comment.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only edit your own comments");
  }
  comment.content = req.body.content;
  comment.edited = true;
  await comment.save();
  res.json({ comment });
});

// @desc  Delete a comment (author or project manager+)
// @route DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  const project = await Project.findById(comment.project);
  const membership = getMembership(project, req.user._id);
  const isAuthor = String(comment.author) === String(req.user._id);
  const isManager = membership && ["owner", "admin", "manager"].includes(membership.role);
  if (!isAuthor && !isManager) {
    res.status(403);
    throw new Error("You don't have permission to delete this comment");
  }
  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
});

// @desc  Toggle an emoji reaction on a comment
// @route POST /api/comments/:id/reactions
export const toggleReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  let reaction = comment.reactions.find((r) => r.emoji === emoji);
  if (!reaction) {
    reaction = { emoji, users: [] };
    comment.reactions.push(reaction);
  }
  const idx = reaction.users.findIndex((id) => String(id) === String(req.user._id));
  if (idx >= 0) reaction.users.splice(idx, 1);
  else reaction.users.push(req.user._id);
  comment.reactions = comment.reactions.filter((r) => r.users.length > 0);
  await comment.save();
  res.json({ comment });
});

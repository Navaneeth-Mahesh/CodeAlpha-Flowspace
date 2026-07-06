import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { getMembership } from "../utils/permissions.js";
import { notify } from "../utils/notify.js";

const ASSIGNEE_POPULATE = { path: "assignees", select: "name email avatarInitials avatarColor" };
const CREATOR_POPULATE = { path: "createdBy", select: "name avatarInitials avatarColor" };

async function requireProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }
  if (!getMembership(project, userId)) {
    const err = new Error("You don't have access to this project");
    err.status = 403;
    throw err;
  }
  return project;
}

// @desc  List tasks for a project, with optional filters
// @route GET /api/projects/:projectId/tasks
export const getTasks = asyncHandler(async (req, res) => {
  const project = await requireProjectAccess(req.params.projectId, req.user._id);
  const { status, priority, assignee, label, search } = req.query;

  const filter = { project: project._id, archived: false };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignees = assignee;
  if (label) filter.labels = label;
  if (search) filter.title = { $regex: search, $options: "i" };

  const tasks = await Task.find(filter)
    .populate(ASSIGNEE_POPULATE)
    .populate(CREATOR_POPULATE)
    .sort({ order: 1, createdAt: 1 });

  res.json({ tasks });
});

// @desc  Search tasks by title across every project the user belongs to (global search)
// @route GET /api/tasks/search?q=
export const searchTasks = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) return res.json({ tasks: [] });

  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
  }).select("_id");

  const tasks = await Task.find({
    project: { $in: projects.map((p) => p._id) },
    archived: false,
    title: { $regex: q, $options: "i" },
  })
    .populate("project", "name color icon")
    .populate(ASSIGNEE_POPULATE)
    .limit(20);

  res.json({ tasks });
});

// @desc  Tasks assigned to the current user across every project (dashboard)
// @route GET /api/tasks/mine
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignees: req.user._id, archived: false })
    .populate("project", "name color icon")
    .populate(ASSIGNEE_POPULATE)
    .sort({ dueDate: 1 });
  res.json({ tasks });
});

// @desc  Single task with populated relations
// @route GET /api/tasks/:id
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(ASSIGNEE_POPULATE).populate(CREATOR_POPULATE);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  res.json({ task });
});

// @desc  Create a task in a project
// @route POST /api/projects/:projectId/tasks
export const createTask = asyncHandler(async (req, res) => {
  const project = await requireProjectAccess(req.params.projectId, req.user._id);
  const { title, description, status, priority, labels, dueDate, assignees, estimatedHours } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Task title is required");
  }

  const count = await Task.countDocuments({ project: project._id, status: status || "todo" });

  const task = await Task.create({
    project: project._id,
    title,
    description,
    status: status || project.columns[0]?.id || "todo",
    priority,
    labels,
    dueDate,
    assignees,
    estimatedHours,
    order: count,
    createdBy: req.user._id,
    activity: [{ type: "created", user: req.user._id }],
  });

  if (assignees?.length) {
    for (const userId of assignees) {
      await notify(req.app.get("io"), {
        recipient: userId,
        actor: req.user._id,
        type: "task_assigned",
        message: `${req.user.name} assigned you to "${task.title}"`,
        project: project._id,
        task: task._id,
      });
    }
  }

  const populated = await task.populate([ASSIGNEE_POPULATE, CREATOR_POPULATE]);
  const io = req.app.get("io");
  if (io) io.to(`project:${project._id}`).emit("task:created", populated);
  res.status(201).json({ task: populated });
});

// @desc  Update a task (fields, status/column move, reorder)
// @route PATCH /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const project = await requireProjectAccess(task.project, req.user._id);

  const allowed = [
    "title",
    "description",
    "status",
    "priority",
    "labels",
    "dueDate",
    "assignees",
    "watchers",
    "order",
    "estimatedHours",
    "actualHours",
  ];

  const previousStatus = task.status;
  const previousAssignees = task.assignees.map(String);

  for (const field of allowed) {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  }

  if (req.body.status && req.body.status !== previousStatus) {
    task.activity.push({ type: "status_changed", user: req.user._id, meta: { from: previousStatus, to: req.body.status } });
  }

  await task.save();

  const io = req.app.get("io");

  if (req.body.status === "done" && previousStatus !== "done") {
    for (const userId of task.assignees) {
      await notify(io, {
        recipient: userId,
        actor: req.user._id,
        type: "task_completed",
        message: `"${task.title}" was marked done`,
        project: project._id,
        task: task._id,
      });
    }
  } else if (req.body.status && req.body.status !== previousStatus) {
    for (const userId of task.assignees) {
      await notify(io, {
        recipient: userId,
        actor: req.user._id,
        type: "task_updated",
        message: `"${task.title}" moved to ${task.status.replace("_", " ")}`,
        project: project._id,
        task: task._id,
      });
    }
  }

  if (req.body.assignees) {
    const newlyAssigned = req.body.assignees.filter((id) => !previousAssignees.includes(String(id)));
    for (const userId of newlyAssigned) {
      await notify(io, {
        recipient: userId,
        actor: req.user._id,
        type: "task_assigned",
        message: `${req.user.name} assigned you to "${task.title}"`,
        project: project._id,
        task: task._id,
      });
    }
  }

  const populated = await task.populate([ASSIGNEE_POPULATE, CREATOR_POPULATE]);
  if (io) io.to(`project:${project._id}`).emit("task:updated", populated);
  res.json({ task: populated });
});

// @desc  Archive / restore a task
// @route PATCH /api/tasks/:id/archive
export const setTaskArchived = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  task.archived = Boolean(req.body.archived);
  await task.save();
  res.json({ task });
});

// @desc  Permanently delete a task
// @route DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const project = await requireProjectAccess(task.project, req.user._id);
  await task.deleteOne();
  const io = req.app.get("io");
  if (io) io.to(`project:${project._id}`).emit("task:deleted", { id: task._id });
  res.json({ message: "Task deleted" });
});

// @desc  Duplicate a task
// @route POST /api/tasks/:id/duplicate
export const duplicateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  const copy = await Task.create({
    project: task.project,
    title: `${task.title} (copy)`,
    description: task.description,
    status: task.status,
    priority: task.priority,
    labels: task.labels,
    checklist: task.checklist.map((c) => ({ text: c.text, done: false })),
    createdBy: req.user._id,
  });
  res.status(201).json({ task: copy });
});

// @desc  Add / toggle / remove a checklist item
// @route POST /api/tasks/:id/checklist
export const addChecklistItem = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  task.checklist.push({ text: req.body.text, done: false });
  await task.save();
  res.status(201).json({ task });
});

export const updateChecklistItem = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  const item = task.checklist.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Checklist item not found");
  }
  if (req.body.text !== undefined) item.text = req.body.text;
  if (req.body.done !== undefined) item.done = req.body.done;
  await task.save();
  res.json({ task });
});

export const deleteChecklistItem = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireProjectAccess(task.project, req.user._id);
  task.checklist = task.checklist.filter((c) => String(c._id) !== req.params.itemId);
  await task.save();
  res.json({ task });
});

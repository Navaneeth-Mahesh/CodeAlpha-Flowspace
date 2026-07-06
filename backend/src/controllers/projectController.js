import asyncHandler from "express-async-handler";
import Project, { DEFAULT_COLUMNS } from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { getMembership, hasRoleAtLeast } from "../utils/permissions.js";
import { notify } from "../utils/notify.js";

const MEMBER_POPULATE = { path: "members.user", select: "name email avatarInitials avatarColor" };
const OWNER_POPULATE = { path: "owner", select: "name email avatarInitials avatarColor" };

// @desc  List all projects the current user owns or belongs to
// @route GET /api/projects?archived=true|false&favorite=true
export const getProjects = asyncHandler(async (req, res) => {
  const archived = req.query.archived === "true";
  const filter = {
    archived,
    $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
  };
  if (req.query.favorite === "true") filter.favoritedBy = req.user._id;

  const projects = await Project.find(filter)
    .populate(OWNER_POPULATE)
    .populate(MEMBER_POPULATE)
    .sort({ updatedAt: -1 });

  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const [taskCount, doneCount] = await Promise.all([
        Task.countDocuments({ project: p._id, archived: false }),
        Task.countDocuments({ project: p._id, archived: false, status: "done" }),
      ]);
      const obj = p.toObject();
      obj.isFavorite = p.favoritedBy.some((id) => String(id) === String(req.user._id));
      obj.taskCount = taskCount;
      obj.doneCount = doneCount;
      return obj;
    })
  );

  res.json({ projects: withCounts });
});

// @desc  Get a single project (must be owner or member)
// @route GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(OWNER_POPULATE).populate(MEMBER_POPULATE);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!getMembership(project, req.user._id)) {
    res.status(403);
    throw new Error("You don't have access to this project");
  }
  const obj = project.toObject();
  obj.isFavorite = project.favoritedBy.some((id) => String(id) === String(req.user._id));
  res.json({ project: obj });
});

// @desc  Create a project — creator becomes owner
// @route POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color, icon, visibility } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const project = await Project.create({
    name,
    description,
    color,
    icon,
    visibility,
    owner: req.user._id,
    members: [],
    columns: DEFAULT_COLUMNS,
  });

  const populated = await project.populate(OWNER_POPULATE);
  res.status(201).json({ project: populated });
});

// @desc  Update project fields
// @route PATCH /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "manager")) {
    res.status(403);
    throw new Error("You don't have permission to edit this project");
  }

  const allowed = ["name", "description", "color", "icon", "visibility", "columns"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  }
  await project.save();
  res.json({ project });
});

// @desc  Permanently delete a project (owner only)
// @route DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (String(project.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the project owner can permanently delete it");
  }
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project deleted" });
});

// @desc  Archive / restore
// @route PATCH /api/projects/:id/archive
export const setArchived = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "manager")) {
    res.status(403);
    throw new Error("You don't have permission to archive this project");
  }
  project.archived = Boolean(req.body.archived);
  project.archivedAt = project.archived ? new Date() : undefined;
  await project.save();
  res.json({ project });
});

// @desc  Toggle favorite for the current user
// @route PATCH /api/projects/:id/favorite
export const toggleFavorite = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!getMembership(project, req.user._id)) {
    res.status(403);
    throw new Error("You don't have access to this project");
  }
  const idx = project.favoritedBy.findIndex((id) => String(id) === String(req.user._id));
  if (idx >= 0) project.favoritedBy.splice(idx, 1);
  else project.favoritedBy.push(req.user._id);
  await project.save();
  res.json({ isFavorite: idx < 0 });
});

// @desc  Duplicate a project (structure + columns, not tasks)
// @route POST /api/projects/:id/duplicate
export const duplicateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!getMembership(project, req.user._id)) {
    res.status(403);
    throw new Error("You don't have access to this project");
  }
  const copy = await Project.create({
    name: `${project.name} (copy)`,
    description: project.description,
    color: project.color,
    icon: project.icon,
    visibility: project.visibility,
    owner: req.user._id,
    columns: project.columns,
  });
  res.status(201).json({ project: copy });
});

// @desc  Invite a member by email. Existing users are added immediately;
//        unregistered emails are stored as a pending invite resolved at signup.
// @route POST /api/projects/:id/invite
export const inviteMember = asyncHandler(async (req, res, next) => {
  const { email, role = "member" } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("An email address is required");
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "manager")) {
    res.status(403);
    throw new Error("You don't have permission to invite members to this project");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const alreadyMember =
      String(project.owner) === String(existingUser._id) ||
      project.members.some((m) => String(m.user) === String(existingUser._id));
    if (alreadyMember) {
      res.status(409);
      throw new Error("That person is already on this project");
    }
    project.members.push({ user: existingUser._id, role });
    await project.save();
    await notify(req.app.get("io"), {
      recipient: existingUser._id,
      actor: req.user._id,
      type: "project_invite",
      message: `${req.user.name} added you to "${project.name}"`,
      project: project._id,
    });
    const populated = await project.populate(MEMBER_POPULATE);
    return res.status(201).json({ project: populated, status: "added" });
  }

  const alreadyPending = project.pendingInvites.some((i) => i.email === normalizedEmail);
  if (alreadyPending) {
    res.status(409);
    throw new Error("That email has already been invited");
  }
  project.pendingInvites.push({ email: normalizedEmail, role, invitedBy: req.user._id });
  await project.save();
  res.status(201).json({ project, status: "pending" });
});

// @desc  Remove a member (or cancel a pending invite)
// @route DELETE /api/projects/:id/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "manager")) {
    res.status(403);
    throw new Error("You don't have permission to remove members");
  }
  project.members = project.members.filter((m) => String(m.user) !== req.params.userId);
  await project.save();
  res.json({ project });
});

// @desc  Cancel a pending (not-yet-registered) invite
// @route DELETE /api/projects/:id/invites/:email
export const cancelInvite = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "manager")) {
    res.status(403);
    throw new Error("You don't have permission to manage invites");
  }
  const email = req.params.email.toLowerCase();
  project.pendingInvites = project.pendingInvites.filter((i) => i.email !== email);
  await project.save();
  res.json({ project });
});

// @desc  Update a member's role
// @route PATCH /api/projects/:id/members/:userId
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  if (!hasRoleAtLeast(project, req.user._id, "admin")) {
    res.status(403);
    throw new Error("You don't have permission to change roles");
  }
  const member = project.members.find((m) => String(m.user) === req.params.userId);
  if (!member) {
    res.status(404);
    throw new Error("That person isn't a member of this project");
  }
  member.role = role;
  await project.save();
  res.json({ project });
});

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { getMembership } from "../utils/permissions.js";

// @desc  Look up an exact user by email (used when inviting to a project)
// @route GET /api/users/lookup?email=
export const lookupByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "name email avatarInitials avatarColor"
  );
  res.json({ user: user || null });
});

// @desc  Search people you actually share a project with (for @mentions, assignee pickers)
// @route GET /api/users/collaborators?projectId=&q=
export const searchCollaborators = asyncHandler(async (req, res) => {
  const { projectId, q = "" } = req.query;

  let candidateIds = new Set();

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project || !getMembership(project, req.user._id)) {
      res.status(403);
      throw new Error("You don't have access to this project");
    }
    candidateIds.add(String(project.owner));
    project.members.forEach((m) => candidateIds.add(String(m.user)));
  } else {
    // Every project the user belongs to
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    });
    projects.forEach((p) => {
      candidateIds.add(String(p.owner));
      p.members.forEach((m) => candidateIds.add(String(m.user)));
    });
  }

  const users = await User.find({
    _id: { $in: Array.from(candidateIds) },
    name: { $regex: q, $options: "i" },
  }).select("name email avatarInitials avatarColor");

  res.json({ users });
});

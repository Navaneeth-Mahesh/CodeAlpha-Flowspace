import crypto from "crypto";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc  Register a new user, auto-joining any project that pre-invited this email
// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are all required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({ name, email, password });

  // Resolve any pending invites addressed to this email
  const projectsWithInvite = await Project.find({ "pendingInvites.email": email.toLowerCase() });
  for (const project of projectsWithInvite) {
    const invite = project.pendingInvites.find((i) => i.email === email.toLowerCase());
    if (!invite) continue;
    project.members.push({ user: user._id, role: invite.role, joinedAt: new Date() });
    project.pendingInvites = project.pendingInvites.filter((i) => i.email !== email.toLowerCase());
    await project.save();
  }

  const token = generateToken(user._id);
  res.status(201).json({ token, user: user.toSafeObject() });
});

// @desc  Log in
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("No account exists with that email");
  }

  const match = await user.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error("Incorrect password");
  }

  const token = generateToken(user._id);
  res.json({ token, user: user.toSafeObject() });
});

// @desc  Current logged-in user
// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @desc  Update profile fields (name, bio, jobTitle, teamSize, timezone, notificationPrefs)
// @route PATCH /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "bio", "jobTitle", "teamSize", "timezone", "notificationPrefs", "onboarded"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});

// @desc  Change password while logged in
// @route PATCH /api/auth/password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  const match = await user.comparePassword(currentPassword);
  if (!match) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

// @desc  Request a password reset link
// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  // Always respond the same way, whether or not the account exists, to avoid leaking which emails are registered.
  if (!user) {
    return res.json({ message: "If that account exists, a reset link has been sent." });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  const clientOrigin = process.env.CLIENT_ORIGIN?.split(",")[0] || "http://localhost:5173";
  const resetUrl = `${clientOrigin}/reset-password?token=${rawToken}`;

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Reset your Flowspace password",
    html: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  res.json({
    message: "If that account exists, a reset link has been sent.",
    // Only included outside production, so local/dev testing works without real SMTP.
    devResetUrl: process.env.NODE_ENV !== "production" && !emailResult.delivered ? resetUrl : undefined,
  });
});

// @desc  Reset password using a token from the emailed link
// @route POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error("Token and new password are required");
  }

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset. You can now sign in." });
});

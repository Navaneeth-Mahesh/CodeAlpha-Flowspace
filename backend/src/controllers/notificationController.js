import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

// @desc  List notifications for the current user
// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("actor", "name avatarInitials avatarColor")
    .populate("project", "name color icon")
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.json({ notifications, unreadCount });
});

// @desc  Mark one notification read
// @route PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json({ notification });
});

// @desc  Mark all notifications read
// @route PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
});

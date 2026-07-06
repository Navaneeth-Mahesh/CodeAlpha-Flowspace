import Notification from "../models/Notification.js";

/**
 * Creates a notification and, if a live socket connection exists for the
 * recipient, pushes it in real time.
 */
export async function notify(io, { recipient, actor, type, message, project, task }) {
  if (String(recipient) === String(actor)) return null; // don't notify yourself
  const notification = await Notification.create({ recipient, actor, type, message, project, task });
  const populated = await notification.populate("actor", "name avatarInitials avatarColor");

  if (io) {
    io.to(`user:${recipient}`).emit("notification:new", populated);
  }
  return populated;
}

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Wires up Socket.IO auth and room membership.
 * Clients connect with { auth: { token } } and are placed in a personal
 * `user:<id>` room (for notifications) plus `project:<id>` rooms they join
 * explicitly after loading a project (for live task/comment updates).
 */
export function initSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("project:join", (projectId) => {
      if (projectId) socket.join(`project:${projectId}`);
    });

    socket.on("project:leave", (projectId) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });
  });
}

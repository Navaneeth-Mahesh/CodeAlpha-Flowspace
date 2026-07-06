import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "@/services/api";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const token = tokenStorage.get();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const socketUrl = apiUrl.replace(/\/api\/?$/, "");

  socket = io(socketUrl, { auth: { token }, autoConnect: true, transports: ["websocket", "polling"] });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

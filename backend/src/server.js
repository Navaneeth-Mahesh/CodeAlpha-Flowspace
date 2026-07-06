import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSockets } from "./sockets/index.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  initSockets(io);
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`Flowspace API listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

start();

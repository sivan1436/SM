import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Message from "../Models/Messages.js";

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(payload.userId);
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    socket.broadcast.emit("presence:update", {
      userId: socket.userId,
      status: "online",
    });

    socket.on("conversation:join", ({ userId } = {}) => {
      if (userId) {
        socket.join(`conversation:${[socket.userId, String(userId)].sort().join(":")}`);
      }
    });

    socket.on("typing:start", ({ userId } = {}) => {
      if (userId) {
        io.to(`user:${String(userId)}`).emit("typing:update", {
          userId: socket.userId,
          isTyping: true,
        });
      }
    });

    socket.on("typing:stop", ({ userId } = {}) => {
      if (userId) {
        io.to(`user:${String(userId)}`).emit("typing:update", {
          userId: socket.userId,
          isTyping: false,
        });
      }
    });

    socket.on("messages:seen", async ({ userId } = {}) => {
      if (!userId) return;

      await Message.updateMany(
        {
          from_user_id: userId,
          to_user_id: socket.userId,
          seen: false,
        },
        { $set: { seen: true } }
      );

      io.to(`user:${String(userId)}`).emit("messages:seen", {
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("presence:update", {
        userId: socket.userId,
        status: "offline",
      });
    });
  });

  return io;
}

export function getSocketIO() {
  return io;
}

export function emitMessage(message) {
  if (!io || !message) return;

  const payload = message.toObject ? message.toObject() : message;
  const recipientId = String(payload.to_user_id);
  const senderId = String(payload.from_user_id);

  io.to(`user:${recipientId}`).emit("message:new", payload);
  io.to(`user:${senderId}`).emit("message:new", payload);
}

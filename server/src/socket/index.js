import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import NotificationService from "../services/NotificationService.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      // Token payload uses 'userId' (see routes/auth.js)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, avatarUrl: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Join user's personal room for DMs and notifications
    socket.join(`user:${socket.user.id}`);

    // --- Channel/Group Chat ---

    // Join a channel room
    socket.on("channel:join", async ({ channelId, groupId }) => {
      try {
        // Verify membership
        const membership = await prisma.groupMemberShip.findUnique({
          where: {
            userId_groupId: {
              userId: socket.user.id,
              groupId: groupId,
            },
          },
        });

        if (!membership) {
          socket.emit("error", { message: "Not a member of this group" });
          return;
        }

        socket.join(`channel:${channelId}`);
        console.log(`${socket.user.name} joined channel:${channelId}`);
      } catch (error) {
        console.error("Channel join error:", error);
        socket.emit("error", { message: "Failed to join channel" });
      }
    });

    // Leave a channel room
    socket.on("channel:leave", ({ channelId }) => {
      socket.leave(`channel:${channelId}`);
      console.log(`${socket.user.name} left channel:${channelId}`);
    });

    // Send message to channel
    socket.on("channel:message", async ({ channelId, groupId, content }) => {
      try {
        // Verify membership
        const membership = await prisma.groupMemberShip.findUnique({
          where: {
            userId_groupId: {
              userId: socket.user.id,
              groupId: groupId,
            },
          },
        });

        if (!membership) {
          socket.emit("error", { message: "Not a member of this group" });
          return;
        }

        // Save message to DB
        const message = await prisma.groupMessage.create({
          data: {
            content,
            senderId: socket.user.id,
            channelId: channelId,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Broadcast to channel
        io.to(`channel:${channelId}`).emit("channel:message", message);
      } catch (error) {
        console.error("Channel message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("channel:typing", ({ channelId, isTyping }) => {
      socket.to(`channel:${channelId}`).emit("channel:typing", {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping,
      });
    });

    // --- Direct Messages ---

    // Start DM conversation (join room)
    socket.on("dm:join", ({ recipientId }) => {
      // Create a consistent room ID for the DM pair
      const roomId = [socket.user.id, recipientId].sort().join(":");
      socket.join(`dm:${roomId}`);
      console.log(`${socket.user.name} joined DM room: ${roomId}`);
    });

    // Leave DM conversation
    socket.on("dm:leave", ({ recipientId }) => {
      const roomId = [socket.user.id, recipientId].sort().join(":");
      socket.leave(`dm:${roomId}`);
    });

    // Send DM
    socket.on("dm:message", async ({ recipientId, content }) => {
      try {
        // Verify recipient exists
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
        });

        if (!recipient) {
          socket.emit("error", { message: "Recipient not found" });
          return;
        }

        // Save message to DB
        const message = await prisma.directMessage.create({
          data: {
            content,
            senderId: socket.user.id,
            receiverId: recipientId,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Emit to both users
        const roomId = [socket.user.id, recipientId].sort().join(":");
        io.to(`dm:${roomId}`).emit("dm:message", message);

        // Create persistent notification for the recipient
        await NotificationService.notifyDM(socket.user.id, recipientId, content);
      } catch (error) {
        console.error("DM send error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // DM typing indicator
    socket.on("dm:typing", ({ recipientId, isTyping }) => {
      const roomId = [socket.user.id, recipientId].sort().join(":");
      socket.to(`dm:${roomId}`).emit("dm:typing", {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping,
      });
    });

    // --- Notifications ---

    socket.on("notification:read", async ({ notificationId }) => {
      // Future: Mark notification as read in DB
      console.log(`Notification ${notificationId} marked as read`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
}

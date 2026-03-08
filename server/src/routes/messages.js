import express from "express";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all conversations (unique users the current user has messaged with)
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all users the current user has exchanged messages with
    const sentMessages = await prisma.directMessage.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const receivedMessages = await prisma.directMessage.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    // Combine unique user IDs
    const userIds = new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);

    // Get user details and last message for each conversation
    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const user = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        });

        const lastMessage = await prisma.directMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        });

        // Count unread messages (messages from other user that are not read yet)
        const unreadCount = await prisma.directMessage.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            readAt: null,
          },
        });

        return {
          user,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Get messages with a specific user
router.get("/dm/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    const cursor = req.query.cursor;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
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
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    res.json(messages);
  } catch (error) {
    console.error("Get DM messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Mark messages as read from a specific user
router.put("/mark-as-read/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Update all unread messages from otherUserId to currentUserId
    const result = await prisma.directMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ markedAsRead: result.count });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Get available users for a new conversation (excluding current user)
router.get("/users/available", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        course: true,
      },
      orderBy: { name: "asc" },
      // Optional: Add take: 50 if the user base grows too large to prevent huge payloads
    });

    res.json(users);
  } catch (error) {
    console.error("Get available users error:", error);
    res.status(500).json({ error: "Failed to get available users" });
  }
});

// Get user info for starting a new conversation
router.get("/users/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;

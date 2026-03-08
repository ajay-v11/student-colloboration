import express from "express";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateUserSchema } from "../validations/users.validation.js";

const router = express.Router();

// GET /api/users/suggestions - Get suggested users to message (excludes self and existing conversations)
router.get("/suggestions", authMiddleware, async (req, res) => {
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

    // Combine unique user IDs to exclude
    const excludeIds = new Set([
      userId,
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);

    // Get users excluding self and existing conversations, then shuffle and take 4
    const allSuggestions = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludeIds] },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        course: true,
      },
    });

    // Shuffle and take 4 random users
    const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
    const suggestions = shuffled.slice(0, 4).map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      email: u.email,
      role: u.course,
    }));

    res.json(suggestions);
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// GET /api/getUsers - Get all users, Probably should change to something like follwing users, recommened to follow  with
// query params, or filters etc..
router.get("/getUsers", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// GET /api/users/:id - Get user profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        course: true,
        semester: true,
        college: true,
        skills: true,
        interests: true,
        bio: true,
        avatarUrl: true,
        github: true,
        linkedin: true,
        twitter: true,
        experience: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate stats
    const [sentMessages, receivedMessages, projectsCount, groupsCount] = await Promise.all([
      prisma.directMessage.findMany({
        where: { senderId: req.params.id },
        select: { receiverId: true },
        distinct: ["receiverId"],
      }),
      prisma.directMessage.findMany({
        where: { receiverId: req.params.id },
        select: { senderId: true },
        distinct: ["senderId"],
      }),
      prisma.project.count({
        where: { authorId: req.params.id }
      }),
      prisma.groupMemberShip.count({
        where: { userId: req.params.id }
      })
    ]);

    const uniqueConnections = new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);
    // remove self if present
    uniqueConnections.delete(req.params.id);

    const stats = {
      connections: uniqueConnections.size,
      projects: projectsCount,
      groups: groupsCount,
    };

    res.json({ user: { ...user, stats } });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// PUT /api/users/:id - Update user profile
router.put("/:id", authMiddleware, validate(updateUserSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    // Users can only update their own profile
    if (req.params.id !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this profile" });
    }

    const { name, course, semester, college, skills, interests, bio, avatarUrl, github, linkedin, twitter, experience } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        course,
        semester,
        college,
        skills,
        interests,
        bio,
        avatarUrl,
        github,
        linkedin,
        twitter,
        experience,
      },
      select: {
        id: true,
        email: true,
        name: true,
        course: true,
        semester: true,
        college: true,
        skills: true,
        interests: true,
        bio: true,
        avatarUrl: true,
        github: true,
        linkedin: true,
        twitter: true,
        experience: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;

import express from "express";
import { validate } from "../middleware/validate.js";
import { createGroupSchema, createChannelSchema, sendMessageSchema } from "../validations/groups.validation.js";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";
import NotificationService from "../services/NotificationService.js";

const router = express.Router();

// Create a group
router.post("/createGroup", authMiddleware, validate(createGroupSchema), async (req, res) => {
  try {
    const groupData = req.body;
    const userId = req.user.id;

    // Transaction to create group, add admin, and create default channel
    const newGroup = await prisma.$transaction(async (tx) => {
      // 1. Create Group
      const group = await tx.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          interests: groupData.interests,
          adminId: userId,
        },
      });

      // 2. Add Admin Member
      await tx.groupMemberShip.create({
        data: {
          userId: userId,
          groupId: group.id,
          role: "ADMIN",
        },
      });

      // 3. Create Default 'General' Channel
      await tx.channel.create({
        data: {
          name: "General",
          type: "TEXT",
          groupId: group.id,
          position: 0,
        },
      });

      return group;
    });

    res.status(201).json(newGroup);
  } catch (error) {
    // Handle unique constraint violation (e.g. duplicate group name)
    if (error.code === 'P2002') {
       return res.status(409).json({ error: "Group name already exists" });
    }
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Get My Groups (Joined) - excludes project-linked groups
router.get("/my-groups", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await prisma.group.findMany({
      where: {
        GroupMemberShip: {
          some: { userId: userId }
        },
        project: null // Exclude groups that are linked to a project
      },
      select: {
        id: true,
        name: true,
        description: true,
        interests: true,
        groupIconUrl: true,
        createdAt: true,
        _count: {
          select: { GroupMemberShip: true }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    console.error("Get my groups error:", error);
    res.status(500).json({ error: "Failed to get my groups" });
  }
});

// Get Discover Groups (Not Joined) - excludes project-linked groups
router.get("/discover", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await prisma.group.findMany({
      where: {
        GroupMemberShip: {
          none: { userId: userId }
        },
        project: null // Exclude groups that are linked to a project
      },
      select: {
        id: true,
        name: true,
        description: true,
        interests: true,
        groupIconUrl: true,
        createdAt: true,
        _count: {
          select: { GroupMemberShip: true }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    console.error("Get discover groups error:", error);
    res.status(500).json({ error: "Failed to get discoverable groups" });
  }
});

// Leave a group
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;

    // Check if member
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return res.status(400).json({ error: "Not a member of this group" });
    }

    if (membership.role === 'ADMIN') {
        // Optional: Prevent admin from leaving if they are the only admin, or handle admin transfer
        // For now, allow leaving, but warn or just delete membership
    }

    await prisma.groupMemberShip.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

// Join a group
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if already a member
    const existingMembership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({ error: "Already a member of this group" });
    }

    const membership = await prisma.groupMemberShip.create({
      data: {
        userId: userId,
        groupId: groupId,
        role: "MEMBER",
      },
    });

    // Send notification for joining group
    await NotificationService.notifyGroupJoin(userId, groupId, group.name);

    res.status(200).json({ message: "Joined group successfully", membership });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

// Get a specific group details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;

    // Check if user is a member using the unique compound key
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "User is not a part of this group" });
    }

    const groupInfo = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        Channel: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            name: true,
            type: true,
          }
        },
        GroupMemberShip: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              }
            }
          }
        }
      }
    });

    if (!groupInfo) return res.status(404).json({ error: "Group not found" });

    // Format the response to match expected frontend structure if needed, 
    // or return the richer data structure
    const formattedGroup = {
      ...groupInfo,
      participants: groupInfo.GroupMemberShip.map(m => ({
        ...m.user,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      channels: groupInfo.Channel
    };
    
    // Remove the raw relation to avoid duplication in response if desired
    delete formattedGroup.GroupMemberShip;
    delete formattedGroup.Channel;

    res.json(formattedGroup);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ error: "Failed to get group info" });
  }
});

// Get All groups
router.get("/", async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        interests: true,
        _count: {
          select: { GroupMemberShip: true }
        }
      },
    });
    res.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to get groups" });
  }
});

// --- Channel Routes ---

// Create a channel
router.post("/:id/channels", authMiddleware, validate(createChannelSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.id;
    const channelData = req.body;

    // Verify user is admin of the group
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can create channels" });
    }

    // Get current channel count to set position
    const channelCount = await prisma.channel.count({
      where: { groupId: groupId }
    });

    const newChannel = await prisma.channel.create({
      data: {
        name: channelData.name,
        type: channelData.type,
        groupId: groupId,
        position: channelCount,
      },
    });

    res.status(201).json(newChannel);
  } catch (error) {
    console.error("Create channel error:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Delete a channel
router.delete("/:groupId/channels/:channelId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, channelId } = req.params;

    // Verify user is admin of the group
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can delete channels" });
    }

    // Check if channel exists and belongs to group
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.groupId !== groupId) {
      return res.status(404).json({ error: "Channel not found" });
    }

    await prisma.channel.delete({
      where: { id: channelId },
    });

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Delete channel error:", error);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

// Get messages for a channel
router.get("/:groupId/channels/:channelId/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, channelId } = req.params;

    // Verify membership
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const messages = await prisma.groupMessage.findMany({
      where: { channelId: channelId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { id: 'asc' }, // Assuming chronological order by ID or createdAt (schema has no createdAt for GroupMessage? let's check)
    });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send a message
router.post("/:groupId/channels/:channelId/messages", authMiddleware, validate(sendMessageSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, channelId } = req.params;
    const { content, fileUrl, fileName, fileType } = req.body;

    // Verify membership
    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const message = await prisma.groupMessage.create({
      data: {
        content,
        senderId: userId,
        channelId: channelId,
        fileUrl,
        fileName,
        fileType,
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

    // TODO: Socket.io emission would go here
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;

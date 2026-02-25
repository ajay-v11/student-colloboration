import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const createProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 chars"),
  description: z.string().min(10, "Description must be at least 10 chars"),
  tags: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
});

// Create a project (with linked group for collaboration)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const projectData = createProjectSchema.parse(req.body);
    const userId = req.user.id;

    // Transaction to create project + linked group + channel + membership
    const project = await prisma.$transaction(async (tx) => {
      // 1. Create the linked Group
      const group = await tx.group.create({
        data: {
          name: `Project: ${projectData.title}`,
          description: projectData.description,
          interests: projectData.tags,
          adminId: userId,
        },
      });

      // 2. Add creator as admin member
      await tx.groupMemberShip.create({
        data: {
          userId: userId,
          groupId: group.id,
          role: "ADMIN",
        },
      });

      // 3. Create default "general" channel
      await tx.channel.create({
        data: {
          name: "general",
          type: "TEXT",
          groupId: group.id,
          position: 0,
        },
      });

      // 4. Create the project linked to the group
      const newProject = await tx.project.create({
        data: {
          ...projectData,
          authorId: userId,
          groupId: group.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return newProject;
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A project with this name already exists" });
    }
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get all projects (with membership status for logged-in user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            GroupMemberShip: {
              where: { userId: userId },
              select: { id: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response to include isMember flag
    const formattedProjects = projects.map((project) => ({
      ...project,
      groupId: project.group?.id || null,
      isMember: project.group?.GroupMemberShip?.length > 0,
      memberRole: project.group?.GroupMemberShip?.[0]?.role || null,
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Failed to get projects" });
  }
});

// Join a project (joins the linked group)
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { group: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.groupId) {
      return res.status(400).json({ error: "Project has no collaboration group" });
    }

    // Check if already a member
    const existingMembership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: project.groupId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({ error: "Already a member of this project" });
    }

    await prisma.groupMemberShip.create({
      data: {
        userId: userId,
        groupId: project.groupId,
        role: "MEMBER",
      },
    });

    res.json({ message: "Joined project successfully", groupId: project.groupId });
  } catch (error) {
    console.error("Join project error:", error);
    res.status(500).json({ error: "Failed to join project" });
  }
});

// Get project by ID (full details with group, channels, members, resources)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        resources: {
          include: {
            addedBy: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        group: {
          include: {
            Channel: {
              orderBy: { position: "asc" },
              select: { id: true, name: true, type: true },
            },
            GroupMemberShip: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check membership
    const membership = project.group?.GroupMemberShip?.find(
      (m) => m.userId === userId
    );

    // Format response
    const formattedProject = {
      ...project,
      isMember: !!membership,
      memberRole: membership?.role || null,
      channels: project.group?.Channel || [],
      participants: (project.group?.GroupMemberShip || []).map((m) => ({
        ...m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };

    // Clean up nested data
    delete formattedProject.group?.Channel;
    delete formattedProject.group?.GroupMemberShip;

    res.json(formattedProject);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Failed to get project" });
  }
});

// Update project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const projectData = createProjectSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.authorId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: projectData,
    });

    res.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.authorId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// --- Resource Routes ---

const createResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["link", "doc", "file", "video"]).default("link"),
});

// Add a resource to a project
router.post("/:id/resources", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const resourceData = createResourceSchema.parse(req.body);

    // Verify project exists and user is a member
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        group: {
          include: {
            GroupMemberShip: { where: { userId: userId } },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.group?.GroupMemberShip?.length) {
      return res.status(403).json({ error: "Must be a project member to add resources" });
    }

    const resource = await prisma.projectResource.create({
      data: {
        ...resourceData,
        projectId: projectId,
        addedById: userId,
      },
      include: {
        addedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Add resource error:", error);
    res.status(500).json({ error: "Failed to add resource" });
  }
});

// Delete a resource
router.delete("/:projectId/resources/:resourceId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, resourceId } = req.params;

    const resource = await prisma.projectResource.findUnique({
      where: { id: resourceId },
      include: {
        project: {
          include: {
            group: {
              include: {
                GroupMemberShip: { where: { userId: userId } },
              },
            },
          },
        },
      },
    });

    if (!resource || resource.projectId !== projectId) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Only resource creator or admin can delete
    const membership = resource.project?.group?.GroupMemberShip?.[0];
    if (resource.addedById !== userId && membership?.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this resource" });
    }

    await prisma.projectResource.delete({
      where: { id: resourceId },
    });

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

// Leave a project
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.groupId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const membership = await prisma.groupMemberShip.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: project.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(400).json({ error: "Not a member of this project" });
    }

    await prisma.groupMemberShip.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: project.groupId,
        },
      },
    });

    res.json({ message: "Left project successfully" });
  } catch (error) {
    console.error("Leave project error:", error);
    res.status(500).json({ error: "Failed to leave project" });
  }
});

export default router;

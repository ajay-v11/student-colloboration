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

// Create a project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const projectData = createProjectSchema.parse(req.body);
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Failed to get projects" });
  }
});

// Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
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

export default router;

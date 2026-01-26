import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const createInternshipSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 chars"),
  role: z.string().min(2, "Role must be at least 2 chars"),
  description: z.string().min(10, "Description must be at least 10 chars"),
  location: z.string().min(2, "Location required"),
  type: z.enum(["Remote", "On-site", "Hybrid"]),
  applyUrl: z.string().url("Invalid URL"),
});

// Create an internship
router.post("/", authMiddleware, async (req, res) => {
  try {
    const internshipData = createInternshipSchema.parse(req.body);
    const userId = req.user.id;

    const internship = await prisma.internship.create({
      data: {
        ...internshipData,
        postedById: userId,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(internship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Create internship error:", error);
    res.status(500).json({ error: "Failed to create internship" });
  }
});

// Get all internships
router.get("/", async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(internships);
  } catch (error) {
    console.error("Get internships error:", error);
    res.status(500).json({ error: "Failed to get internships" });
  }
});

// Get internship by ID
router.get("/:id", async (req, res) => {
  try {
    const internship = await prisma.internship.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    res.json(internship);
  } catch (error) {
    console.error("Get internship error:", error);
    res.status(500).json({ error: "Failed to get internship" });
  }
});

// Update internship
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;
    const internshipData = createInternshipSchema.parse(req.body);

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    });

    if (!internship) return res.status(404).json({ error: "Internship not found" });
    if (internship.postedById !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedInternship = await prisma.internship.update({
      where: { id: internshipId },
      data: internshipData,
    });

    res.json(updatedInternship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Update internship error:", error);
    res.status(500).json({ error: "Failed to update internship" });
  }
});

// Delete internship
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    });

    if (!internship) return res.status(404).json({ error: "Internship not found" });
    if (internship.postedById !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.internship.delete({
      where: { id: internshipId },
    });

    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    console.error("Delete internship error:", error);
    res.status(500).json({ error: "Failed to delete internship" });
  }
});

export default router;

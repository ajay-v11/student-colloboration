import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/feed", authMiddleware, async (req, res) => {
  try {
    const [groups, projects, internships] = await Promise.all([
      prisma.group.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { GroupMemberShip: true } },
        },
      }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { name: true } },
        },
      }),
      prisma.internship.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          postedBy: { select: { name: true } },
        },
      }),
    ]);

    const feed = [
      ...groups.map((g) => ({
        id: g.id,
        type: "group",
        title: g.name,
        author: "Community",
        desc: g.description,
        tags: g.interests,
        memberCount: g._count.GroupMemberShip,
        createdAt: g.createdAt,
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: "project",
        title: p.title,
        author: p.author.name,
        desc: p.description,
        tags: p.tags,
        createdAt: p.createdAt,
      })),
      ...internships.map((i) => ({
        id: i.id,
        type: "internship",
        title: `${i.role} @ ${i.company}`,
        author: i.postedBy.name,
        desc: i.description,
        tags: [i.type, i.location].filter(Boolean),
        createdAt: i.createdAt,
      })),
    ];

    feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(feed);
  } catch (error) {
    console.error("Dashboard feed error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard feed" });
  }
});

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [usersCount, groupsCount] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
    ]);

    res.json({
      users: usersCount,
      groups: groupsCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;

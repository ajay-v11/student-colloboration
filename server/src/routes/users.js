import express from 'express';
import prisma from '../lib/prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/:id - Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
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
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;

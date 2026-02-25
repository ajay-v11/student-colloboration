import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import NotificationService from '../services/NotificationService.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, unreadOnly } = req.query;
    const notifications = await NotificationService.getByUserId(req.user.id, {
      limit: parseInt(limit, 10),
      unreadOnly: unreadOnly === 'true',
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await NotificationService.delete(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await NotificationService.clearAll(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

export default router;

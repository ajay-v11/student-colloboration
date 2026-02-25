import prisma from '../lib/prisma.js';

let io = null;

export function setSocketIO(socketIO) {
  io = socketIO;
}

export const NotificationService = {
  async create({ type, title, content, userId, senderId = null, groupId = null, channelId = null, metadata = null }) {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        content,
        userId,
        senderId,
        groupId,
        channelId,
        metadata,
      },
      include: {
        sender: {
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
            groupIconUrl: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  },

  async createForMultipleUsers({ type, title, content, userIds, senderId = null, groupId = null, channelId = null, metadata = null }) {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.create({ type, title, content, userId, senderId, groupId, channelId, metadata })
      )
    );
    return notifications;
  },

  async getByUserId(userId, { limit = 50, unreadOnly = false } = {}) {
    const where = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
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
            groupIconUrl: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async delete(notificationId, userId) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  },

  async clearAll(userId) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },

  async notifyDM(senderId, receiverId, messageContent) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    return this.create({
      type: 'DM_MESSAGE',
      title: `New message from ${sender?.name || 'Someone'}`,
      content: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
      userId: receiverId,
      senderId,
      metadata: { messagePreview: messageContent.substring(0, 200) },
    });
  },

  async notifyGroupJoin(userId, groupId, groupName) {
    return this.create({
      type: 'GROUP_JOIN',
      title: `Welcome to ${groupName}!`,
      content: `You have joined the group "${groupName}"`,
      userId,
      groupId,
    });
  },

  async notifyGroupInvite(userId, groupId, groupName, inviterId) {
    return this.create({
      type: 'GROUP_INVITE',
      title: `Invited to ${groupName}`,
      content: `You've been invited to join "${groupName}"`,
      userId,
      senderId: inviterId,
      groupId,
    });
  },

  async notifyGroupMessage(senderId, channelId, groupId, messageContent, excludeUserId = null) {
    const [channel, members] = await Promise.all([
      prisma.channel.findUnique({
        where: { id: channelId },
        include: { group: { select: { name: true } } },
      }),
      prisma.groupMemberShip.findMany({
        where: { groupId },
        select: { userId: true },
      }),
    ]);

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    const userIds = members
      .map(m => m.userId)
      .filter(id => id !== senderId && id !== excludeUserId);

    if (userIds.length === 0) return [];

    return this.createForMultipleUsers({
      type: 'GROUP_MESSAGE',
      title: `${sender?.name || 'Someone'} in #${channel?.name || 'channel'}`,
      content: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
      userIds,
      senderId,
      groupId,
      channelId,
      metadata: {
        groupName: channel?.group?.name,
        channelName: channel?.name,
      },
    });
  },
};

export default NotificationService;

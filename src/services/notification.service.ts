import { NotificationRepository } from "@/repositories/notification.repository";

export class NotificationService {
  static async getUserNotifications(userId: string) {
    const notifications = await NotificationRepository.findUserNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  static async markAsRead(userId: string, notificationId: string) {
    return NotificationRepository.markAsRead(notificationId, userId);
  }

  static async markAllAsRead(userId: string) {
    return NotificationRepository.markAllAsRead(userId);
  }
}

import { db } from "@/lib/db";

export class NotificationRepository {
  static async findUserNotifications(userId: string) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notif = await db.notification.findUnique({ where: { id: notificationId } });
    if (!notif) throw new Error("Notification not found");

    if (notif.userId !== userId) {
      throw new Error("FORBIDDEN: You do not own this notification.");
    }

    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

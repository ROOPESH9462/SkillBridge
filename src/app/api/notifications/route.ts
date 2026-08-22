import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const result = await NotificationService.getUserNotifications(user.userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch notifications" },
      { status }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.all) {
      await NotificationService.markAllAsRead(user.userId);
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (body.id) {
      await NotificationService.markAsRead(user.userId, body.id);
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: false, message: "Notification ID or all flag required." }, { status: 400 });
  } catch (error: any) {
    const status = error.message.includes("FORBIDDEN") ? 403 : error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update notification" },
      { status }
    );
  }
}

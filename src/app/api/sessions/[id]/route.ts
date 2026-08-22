import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { BookingService } from "@/services/booking.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "New session status is required" },
        { status: 400 }
      );
    }

    const session = await BookingService.updateStatus(user.userId, params.id, status);

    return NextResponse.json({
      success: true,
      message: `Session status updated to ${status}.`,
      session,
    });
  } catch (error: any) {
    const isForbidden = error.message.includes("FORBIDDEN");
    const status = isForbidden
      ? 403
      : error.message === "UNAUTHORIZED"
      ? 401
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to update session" },
      { status }
    );
  }
}

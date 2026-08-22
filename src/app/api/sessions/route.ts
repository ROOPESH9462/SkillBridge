import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { BookingService } from "@/services/booking.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Check that user is a LEARNER (or ADMIN)
    if (user.role !== "LEARNER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only Learner accounts can book mentorship sessions." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const session = await BookingService.createBooking(user.userId, body);

    return NextResponse.json({
      success: true,
      message: "Mentorship session requested successfully! The mentor will be notified.",
      session,
    });
  } catch (error: any) {
    const isConflict = error.message.includes("DOUBLE_BOOKING_CONFLICT");
    const status = isConflict
      ? 409 // 409 Conflict
      : error.message === "UNAUTHORIZED"
      ? 401
      : error.message === "FORBIDDEN"
      ? 403
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const sessions = await BookingService.getUserSessions(user.userId);

    return NextResponse.json({ success: true, count: sessions.length, sessions });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch sessions" },
      { status }
    );
  }
}

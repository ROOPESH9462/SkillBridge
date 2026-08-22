import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/session";
import { AvailabilityService } from "@/services/availability.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const duration = searchParams.get("duration")
      ? parseInt(searchParams.get("duration")!)
      : 45;

    if (!mentorId || !date) {
      return NextResponse.json(
        { success: false, message: "mentorId and date (YYYY-MM-DD) query parameters are required" },
        { status: 400 }
      );
    }

    const result = await AvailabilityService.getAvailableSlots(mentorId, date, duration);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate slots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();

    const { dayOfWeek, startTime, endTime } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "dayOfWeek, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const availability = await AvailabilityService.addAvailability(user.userId, {
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    });

    return NextResponse.json({
      success: true,
      message: "Availability window added successfully",
      availability,
    });
  } catch (error: any) {
    const status = error.message === "FORBIDDEN" ? 403 : error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add availability" },
      { status }
    );
  }
}

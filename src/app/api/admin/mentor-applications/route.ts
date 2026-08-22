import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { MentorApplicationService } from "@/services/mentor-application.service";

export async function GET(req: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const applications = await MentorApplicationService.getApplications(status);

    return NextResponse.json({ success: true, count: applications.length, applications });
  } catch (error: any) {
    const status = error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json(
      { success: false, message: error.message || "Unauthorized" },
      { status }
    );
  }
}

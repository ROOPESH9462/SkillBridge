import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { MentorService } from "@/services/mentor.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const application = await MentorService.submitApplication(user.userId, body);

    return NextResponse.json({
      success: true,
      message: "Mentor application submitted successfully for admin review.",
      application,
    });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit application" },
      { status }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const application = await MentorService.getUserApplication(user.userId);

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch application" },
      { status: 401 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { MentorApplicationService } from "@/services/mentor-application.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole("ADMIN");

    const body = await req.json();
    const { action } = body;

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { success: false, message: "Action must be either APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const application = await MentorApplicationService.reviewApplication(params.id, action);

    return NextResponse.json({
      success: true,
      message: `Mentor application successfully ${action.toLowerCase()}d!`,
      application,
    });
  } catch (error: any) {
    const status = error.message === "FORBIDDEN" ? 403 : error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process review" },
      { status }
    );
  }
}

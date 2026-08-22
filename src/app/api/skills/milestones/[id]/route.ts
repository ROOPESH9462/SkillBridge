import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { GoalService } from "@/services/goal.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const result = await GoalService.toggleMilestone(user.userId, params.id);

    return NextResponse.json({
      success: true,
      message: "Milestone status updated successfully.",
      ...result,
    });
  } catch (error: any) {
    const status = error.message.includes("FORBIDDEN")
      ? 403
      : error.message === "UNAUTHORIZED"
      ? 401
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to update milestone" },
      { status }
    );
  }
}

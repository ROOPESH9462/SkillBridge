import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { GoalService } from "@/services/goal.service";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    await GoalService.deleteGoal(user.userId, params.id);

    return NextResponse.json({
      success: true,
      message: "Skill goal deleted successfully.",
    });
  } catch (error: any) {
    const status = error.message.includes("FORBIDDEN")
      ? 403
      : error.message === "UNAUTHORIZED"
      ? 401
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete skill goal" },
      { status }
    );
  }
}

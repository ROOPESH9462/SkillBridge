import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { GoalService } from "@/services/goal.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const goals = await GoalService.getUserGoals(user.userId);
    return NextResponse.json({ success: true, count: goals.length, goals });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch skill goals" },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const goal = await GoalService.createGoal(user.userId, body);

    return NextResponse.json({
      success: true,
      message: "Skill goal and milestone roadmap created successfully!",
      goal,
    });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create skill goal" },
      { status }
    );
  }
}

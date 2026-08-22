import { NextResponse } from "next/server";
import { MentorService } from "@/services/mentor.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const skill = searchParams.get("skill") || undefined;
    const minExperience = searchParams.get("minExperience")
      ? parseInt(searchParams.get("minExperience")!)
      : undefined;
    const minRating = searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : undefined;

    const mentors = await MentorService.getPublicMentors({
      search,
      category,
      skill,
      minExperience,
      minRating,
    });

    return NextResponse.json({ success: true, count: mentors.length, mentors });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}

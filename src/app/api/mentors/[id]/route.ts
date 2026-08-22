import { NextResponse } from "next/server";
import { MentorService } from "@/services/mentor.service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const mentor = await MentorService.getMentorDetails(params.id);
    if (!mentor) {
      return NextResponse.json(
        { success: false, message: "Verified mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, mentor });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch mentor details" },
      { status: 500 }
    );
  }
}

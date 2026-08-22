import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const skills = await db.skill.findMany({
      orderBy: { name: "asc" },
    });

    const categories = Array.from(new Set(skills.map((s) => s.category)));

    return NextResponse.json({ success: true, count: skills.length, categories, skills });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

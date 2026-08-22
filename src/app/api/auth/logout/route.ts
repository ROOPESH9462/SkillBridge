import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function POST() {
  try {
    await AuthService.logout();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}

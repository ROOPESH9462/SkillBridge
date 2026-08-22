import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { AuthService } from "@/services/auth.service";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await AuthService.getMe(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}

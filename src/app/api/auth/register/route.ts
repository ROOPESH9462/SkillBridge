import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await AuthService.register(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}

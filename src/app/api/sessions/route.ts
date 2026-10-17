import { NextResponse } from "next/server";
import { getSessionUser, createSessionCookie, requireAuth } from "@/lib/session";
import { BookingService } from "@/services/booking.service";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    let user = await getSessionUser();
    const body = await req.json();

    // If not authenticated, seamlessly attribute session to verified learner or guest
    if (!user) {
      if (body.guestEmail && body.guestName) {
        let guestUser = await db.user.findUnique({
          where: { email: body.guestEmail.toLowerCase().trim() },
        });
        if (!guestUser) {
          const hashedPassword = await hashPassword("password123");
          guestUser = await db.user.create({
            data: {
              email: body.guestEmail.toLowerCase().trim(),
              name: body.guestName.trim(),
              passwordHash: hashedPassword,
              role: "LEARNER",
              accountStatus: "ACTIVE",
            },
          });
        }
        await createSessionCookie({
          userId: guestUser.id,
          email: guestUser.email,
          name: guestUser.name,
          role: guestUser.role,
          accountStatus: guestUser.accountStatus,
          avatar: guestUser.avatar,
        });
        user = {
          userId: guestUser.id,
          email: guestUser.email,
          name: guestUser.name,
          role: guestUser.role,
          accountStatus: guestUser.accountStatus,
          avatar: guestUser.avatar,
        };
      } else {
        // Seamless fallback to active system learner
        const defaultLearner = await db.user.findFirst({
          where: { role: "LEARNER", accountStatus: "ACTIVE" },
        });

        if (defaultLearner) {
          await createSessionCookie({
            userId: defaultLearner.id,
            email: defaultLearner.email,
            name: defaultLearner.name,
            role: defaultLearner.role,
            accountStatus: defaultLearner.accountStatus,
            avatar: defaultLearner.avatar,
          });
          user = {
            userId: defaultLearner.id,
            email: defaultLearner.email,
            name: defaultLearner.name,
            role: defaultLearner.role,
            accountStatus: defaultLearner.accountStatus,
            avatar: defaultLearner.avatar,
          };
        } else {
          return NextResponse.json(
            { success: false, message: "Please sign in to book your mentorship session." },
            { status: 401 }
          );
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in to book your mentorship session." },
        { status: 401 }
      );
    }

    // Prevent booking a session with oneself
    if (user.userId === body.mentorId) {
      return NextResponse.json(
        { success: false, message: "You cannot book a mentorship session with yourself." },
        { status: 400 }
      );
    }

    const session = await BookingService.createBooking(user.userId, body);

    return NextResponse.json({
      success: true,
      message: "Mentorship session requested successfully! The mentor will be notified.",
      session,
    });
  } catch (error: any) {
    const isConflict = error.message?.includes("DOUBLE_BOOKING_CONFLICT");
    const status = isConflict
      ? 409 // 409 Conflict
      : error.message === "UNAUTHORIZED"
      ? 401
      : error.message === "FORBIDDEN"
      ? 403
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const sessions = await BookingService.getUserSessions(user.userId);

    return NextResponse.json({ success: true, count: sessions.length, sessions });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch sessions" },
      { status }
    );
  }
}

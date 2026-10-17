import { cookies } from "next/headers";
import { signJWT, verifyJWT, JWTPayload } from "./auth";
import { db } from "./db";

export const COOKIE_NAME = "sb_session";

export async function createSessionCookie(payload: JWTPayload) {
  const token = signJWT(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return token;
}

export async function destroySessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = verifyJWT(token);
  if (!payload) return null;

  try {
    // 1. Try finding by ID
    let latestUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, accountStatus: true, name: true, avatar: true },
    });

    // 2. Fallback: if database was reseeded, heal using email
    if (!latestUser && payload.email) {
      latestUser = await db.user.findUnique({
        where: { email: payload.email },
        select: { id: true, email: true, role: true, accountStatus: true, name: true, avatar: true },
      });
    }

    // 3. If user exists, return synchronized payload with current database ID
    if (latestUser) {
      return {
        ...payload,
        userId: latestUser.id,
        email: latestUser.email,
        name: latestUser.name,
        role: latestUser.role,
        accountStatus: latestUser.accountStatus,
        avatar: latestUser.avatar,
      };
    }

    // 4. User does not exist in database (stale session cookie)
    return null;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.accountStatus === "SUSPENDED" || user.accountStatus === "DEACTIVATED") {
    throw new Error("ACCOUNT_SUSPENDED");
  }
  return user;
}

export async function requireRole(allowedRoles: string | string[]): Promise<JWTPayload> {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

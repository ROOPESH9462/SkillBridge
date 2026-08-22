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

  // Always synchronize latest role and status from database so Admin approvals take effect in real-time
  try {
    const latestUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, accountStatus: true, name: true, avatar: true },
    });
    if (latestUser) {
      return {
        ...payload,
        name: latestUser.name,
        role: latestUser.role,
        accountStatus: latestUser.accountStatus,
        avatar: latestUser.avatar,
      };
    }
  } catch (e) {
    // fallback to JWT payload
  }

  return payload;
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

import { UserRepository } from "@/repositories/user.repository";
import { MentorRepository } from "@/repositories/mentor.repository";
import { hashPassword, comparePassword } from "@/lib/password";
import { createSessionCookie, destroySessionCookie } from "@/lib/session";
import { registerSchema, loginSchema } from "@/lib/validation";
import { z } from "zod";

export class AuthService {
  static async register(input: z.infer<typeof registerSchema>) {
    const validated = registerSchema.parse(input);

    const existing = await UserRepository.findByEmail(validated.email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    let assignedRole = validated.role || "LEARNER";

    // Admin Verification Rule
    if (validated.role === "ADMIN") {
      const validPasscodes = ["admin123", "admin", "skillbridge-admin-2026", "roopesh-admin"];
      if (!validated.adminSecret || !validPasscodes.includes(validated.adminSecret.trim())) {
        throw new Error("Invalid Admin Passcode Key. Enter a valid admin secret (e.g. admin123).");
      }
      assignedRole = "ADMIN";
    }

    const hashedPassword = await hashPassword(validated.password);

    const user = await UserRepository.createUser({
      email: validated.email,
      name: validated.name,
      passwordHash: hashedPassword,
      role: assignedRole,
    });

    // If registering as a Mentor, automatically create a Pending Mentor Application for Admin Verification Queue
    if (assignedRole === "MENTOR") {
      await MentorRepository.createApplication({
        userId: user.id,
        professionalTitle: "Technical Specialist & Mentor",
        yearsExperience: 3,
        skills: "Next.js, System Design, TypeScript, React",
        bio: `Verified mentor profile for ${user.name}.`,
        reasonForMentoring: "Registered directly as a Mentor on SkillBridge.",
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus,
      avatar: user.avatar,
    };

    await createSessionCookie(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
      },
    };
  }

  static async login(input: z.infer<typeof loginSchema>) {
    const validated = loginSchema.parse(input);

    const user = await UserRepository.findByEmail(validated.email);
    if (!user) {
      throw new Error("Invalid credentials. Please check your email and password.");
    }

    const isMatch = await comparePassword(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid credentials. Please check your email and password.");
    }

    if (user.accountStatus === "SUSPENDED") {
      throw new Error("Your account has been suspended. Please contact platform support.");
    }

    if (user.accountStatus === "DEACTIVATED") {
      throw new Error("Your account is deactivated. Please contact support to reactivate.");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus,
      avatar: user.avatar,
    };

    await createSessionCookie(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        verificationStatus: user.mentorProfile?.verificationStatus || null,
      },
    };
  }

  static async logout() {
    await destroySessionCookie();
  }

  static async getMe(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus,
      avatar: user.avatar,
      mentorProfile: user.mentorProfile,
      userSkills: user.userSkills,
      skillGoals: user.skillGoals,
    };
  }
}

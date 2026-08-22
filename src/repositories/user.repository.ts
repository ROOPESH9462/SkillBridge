import { db } from "@/lib/db";

export class UserRepository {
  static async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        mentorProfile: true,
      },
    });
  }

  static async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        mentorProfile: true,
        userSkills: {
          include: { skill: true },
        },
        skillGoals: {
          include: { skill: true, milestones: true },
        },
      },
    });
  }

  static async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: string;
    avatar?: string;
  }) {
    return db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        passwordHash: data.passwordHash,
        role: data.role || "LEARNER",
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      },
    });
  }
}

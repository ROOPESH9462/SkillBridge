import { db } from "@/lib/db";

export interface MentorFilterParams {
  search?: string;
  category?: string;
  skill?: string;
  minExperience?: number;
  minRating?: number;
}

export class MentorRepository {
  static async findVerifiedMentors(params: MentorFilterParams = {}) {
    const { search, category, skill, minExperience, minRating } = params;

    const whereClause: any = {
      role: "MENTOR",
      accountStatus: "ACTIVE",
    };

    if (search) {
      const term = search.toLowerCase();
      whereClause.OR = [
        { name: { contains: term } },
        { mentorProfile: { professionalTitle: { contains: term } } },
        { mentorProfile: { bio: { contains: term } } },
        {
          userSkills: {
            some: {
              skill: {
                name: { contains: term },
              },
            },
          },
        },
      ];
    }

    if (category) {
      whereClause.userSkills = {
        some: {
          skill: { category },
        },
      };
    }

    if (skill) {
      whereClause.userSkills = {
        some: {
          skill: { name: skill },
        },
      };
    }

    if (minExperience && minExperience > 0) {
      whereClause.mentorProfile = {
        ...whereClause.mentorProfile,
        yearsExperience: { gte: minExperience },
      };
    }

    if (minRating && minRating > 0) {
      whereClause.mentorProfile = {
        ...whereClause.mentorProfile,
        overallRating: { gte: minRating },
      };
    }

    return db.user.findMany({
      where: whereClause,
      include: {
        mentorProfile: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        reviewsReceived: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: { author: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findMentorById(id: string) {
    return db.user.findFirst({
      where: {
        id,
        role: "MENTOR",
        accountStatus: "ACTIVE",
      },
      include: {
        mentorProfile: true,
        userSkills: {
          include: { skill: true },
        },
        availability: true,
        reviewsReceived: {
          include: {
            author: true,
            session: { include: { skill: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async findPendingApplicationByUserId(userId: string) {
    return db.mentorApplication.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });
  }

  static async createApplication(data: {
    userId: string;
    professionalTitle: string;
    yearsExperience: number;
    skills: string;
    bio: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    reasonForMentoring: string;
  }) {
    return db.mentorApplication.create({
      data: {
        userId: data.userId,
        professionalTitle: data.professionalTitle,
        yearsExperience: data.yearsExperience,
        skills: data.skills,
        bio: data.bio,
        portfolioUrl: data.portfolioUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        reasonForMentoring: data.reasonForMentoring,
        status: "PENDING",
      },
    });
  }

  static async findAllApplications(status?: string) {
    return db.mentorApplication.findMany({
      where: status ? { status } : undefined,
      include: {
        user: true,
      },
      orderBy: { submittedAt: "desc" },
    });
  }

  static async findApplicationById(id: string) {
    return db.mentorApplication.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  static async approveApplication(applicationId: string) {
    return db.$transaction(async (tx) => {
      const app = await tx.mentorApplication.findUnique({
        where: { id: applicationId },
      });

      if (!app) throw new Error("Application not found");
      if (app.status !== "PENDING") throw new Error("Application is not in PENDING status");

      // 1. Update application status
      const updatedApp = await tx.mentorApplication.update({
        where: { id: applicationId },
        data: {
          status: "VERIFIED",
          reviewedAt: new Date(),
        },
      });

      // 2. Promote User role to MENTOR
      await tx.user.update({
        where: { id: app.userId },
        data: { role: "MENTOR" },
      });

      // 3. Upsert MentorProfile
      await tx.mentorProfile.upsert({
        where: { userId: app.userId },
        update: {
          professionalTitle: app.professionalTitle,
          yearsExperience: app.yearsExperience,
          bio: app.bio,
          portfolioUrl: app.portfolioUrl,
          linkedinUrl: app.linkedinUrl,
          verificationStatus: "VERIFIED",
          verificationDate: new Date(),
        },
        create: {
          userId: app.userId,
          professionalTitle: app.professionalTitle,
          yearsExperience: app.yearsExperience,
          bio: app.bio,
          portfolioUrl: app.portfolioUrl,
          linkedinUrl: app.linkedinUrl,
          verificationStatus: "VERIFIED",
          verificationDate: new Date(),
        },
      });

      // 4. Auto-link UserSkills for the mentor from application skills
      if (app.skills) {
        const skillNames = app.skills.split(",").map((s) => s.trim()).filter(Boolean);
        for (const name of skillNames) {
          let skill = await tx.skill.findFirst({
            where: { name: { equals: name } },
          });
          if (!skill) {
            skill = await tx.skill.create({
              data: {
                name,
                category: "Software Engineering",
                description: `Technical skill domain: ${name}`,
              },
            });
          }

          const existing = await tx.userSkill.findFirst({
            where: { userId: app.userId, skillId: skill.id },
          });

          if (!existing) {
            await tx.userSkill.create({
              data: {
                userId: app.userId,
                skillId: skill.id,
                proficiency: "EXPERT",
                role: "TEACHING",
                yearsExperience: app.yearsExperience,
              },
            });
          }
        }
      }

      // 5. Seed default weekly Availability Windows (Mon-Fri 09:00 - 17:00)
      const existingAvail = await tx.mentorAvailability.findMany({
        where: { mentorId: app.userId },
      });

      if (existingAvail.length === 0) {
        for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
          await tx.mentorAvailability.create({
            data: {
              mentorId: app.userId,
              dayOfWeek,
              startTime: "09:00",
              endTime: "17:00",
              isActive: true,
            },
          });
        }
      }

      // 6. Create Notification
      await tx.notification.create({
        data: {
          userId: app.userId,
          title: "Mentor Application Approved! 🎉",
          message: "Congratulations! Your mentor application has been verified. Your mentor profile is now live.",
          type: "MENTOR_VERIFIED",
        },
      });

      return updatedApp;
    });
  }

  static async rejectApplication(applicationId: string) {
    return db.$transaction(async (tx) => {
      const app = await tx.mentorApplication.findUnique({
        where: { id: applicationId },
      });

      if (!app) throw new Error("Application not found");

      const updatedApp = await tx.mentorApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: app.userId,
          title: "Mentor Application Update",
          message: "Your application to become a verified mentor was not approved at this time.",
          type: "BOOKING_REJECTED",
        },
      });

      return updatedApp;
    });
  }
}

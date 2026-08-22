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

  static async findAllApplications(statusFilter?: string) {
    const rawApps = await db.mentorApplication.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    // Also include users with role === "MENTOR" who don't have explicit application records
    const mentorUsers = await db.user.findMany({
      where: { role: "MENTOR", accountStatus: "ACTIVE" },
      include: { mentorProfile: true },
    });

    const result = [...rawApps];

    for (const m of mentorUsers) {
      const alreadyIncluded = result.some((a) => a.userId === m.id);
      if (!alreadyIncluded) {
        const synthStatus = m.mentorProfile?.verificationStatus || "PENDING";
        if (!statusFilter || statusFilter === synthStatus) {
          result.push({
            id: `synth-${m.id}`,
            userId: m.id,
            professionalTitle: m.mentorProfile?.professionalTitle || "Registered Technical Mentor",
            yearsExperience: m.mentorProfile?.yearsExperience || 3,
            skills: "Next.js, System Design, TypeScript, React",
            bio: m.mentorProfile?.bio || `Verified mentor account for ${m.name}.`,
            portfolioUrl: m.mentorProfile?.portfolioUrl || null,
            linkedinUrl: m.mentorProfile?.linkedinUrl || null,
            reasonForMentoring: "Registered directly as a Mentor on SkillBridge.",
            status: synthStatus,
            submittedAt: m.createdAt,
            reviewedAt: m.mentorProfile?.verificationDate || null,
            updatedAt: m.updatedAt,
            user: m,
          } as any);
        }
      }
    }

    return result;
  }

  static async findApplicationById(id: string) {
    if (id.startsWith("synth-")) {
      const userId = id.replace("synth-", "");
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { mentorProfile: true },
      });
      if (!user) return null;
      return {
        id,
        userId: user.id,
        professionalTitle: user.mentorProfile?.professionalTitle || "Registered Technical Mentor",
        yearsExperience: user.mentorProfile?.yearsExperience || 3,
        skills: "Next.js, System Design, TypeScript, React",
        bio: user.mentorProfile?.bio || `Verified mentor account for ${user.name}.`,
        portfolioUrl: user.mentorProfile?.portfolioUrl || null,
        linkedinUrl: user.mentorProfile?.linkedinUrl || null,
        reasonForMentoring: "Registered directly as a Mentor on SkillBridge.",
        status: user.mentorProfile?.verificationStatus || "PENDING",
        submittedAt: user.createdAt,
        reviewedAt: user.mentorProfile?.verificationDate || null,
        updatedAt: user.updatedAt,
        user,
      } as any;
    }

    return db.mentorApplication.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  static async approveApplication(applicationId: string) {
    return db.$transaction(async (tx) => {
      let app: any;
      let targetUserId: string;

      if (applicationId.startsWith("synth-")) {
        targetUserId = applicationId.replace("synth-", "");
        app = {
          userId: targetUserId,
          professionalTitle: "Registered Technical Mentor",
          yearsExperience: 3,
          skills: "Next.js, System Design, TypeScript, React",
          bio: "Verified mentor profile on SkillBridge.",
          portfolioUrl: null,
          linkedinUrl: null,
        };
      } else {
        app = await tx.mentorApplication.findUnique({
          where: { id: applicationId },
        });
        if (!app) throw new Error("Application not found");
        targetUserId = app.userId;

        await tx.mentorApplication.update({
          where: { id: applicationId },
          data: {
            status: "VERIFIED",
            reviewedAt: new Date(),
          },
        });
      }

      // 1. Promote User role to MENTOR
      await tx.user.update({
        where: { id: targetUserId },
        data: { role: "MENTOR" },
      });

      // 2. Upsert MentorProfile
      await tx.mentorProfile.upsert({
        where: { userId: targetUserId },
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
          userId: targetUserId,
          professionalTitle: app.professionalTitle,
          yearsExperience: app.yearsExperience,
          bio: app.bio,
          portfolioUrl: app.portfolioUrl,
          linkedinUrl: app.linkedinUrl,
          verificationStatus: "VERIFIED",
          verificationDate: new Date(),
        },
      });

      // 3. Auto-link UserSkills for the mentor
      if (app.skills) {
        const skillNames = app.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
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
            where: { userId: targetUserId, skillId: skill.id },
          });

          if (!existing) {
            await tx.userSkill.create({
              data: {
                userId: targetUserId,
                skillId: skill.id,
                proficiency: "EXPERT",
                role: "TEACHING",
                yearsExperience: app.yearsExperience,
              },
            });
          }
        }
      }

      // 4. Seed default weekly Availability Windows (Mon-Fri 09:00 - 17:00)
      const existingAvail = await tx.mentorAvailability.findMany({
        where: { mentorId: targetUserId },
      });

      if (existingAvail.length === 0) {
        for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
          await tx.mentorAvailability.create({
            data: {
              mentorId: targetUserId,
              dayOfWeek,
              startTime: "09:00",
              endTime: "17:00",
              isActive: true,
            },
          });
        }
      }

      // 5. Create Notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: "Mentor Application Approved! 🎉",
          message: "Congratulations! Your mentor application has been verified. Your mentor profile is now live.",
          type: "MENTOR_VERIFIED",
        },
      });

      return { success: true };
    });
  }

  static async rejectApplication(applicationId: string) {
    return db.$transaction(async (tx) => {
      let targetUserId: string;

      if (applicationId.startsWith("synth-")) {
        targetUserId = applicationId.replace("synth-", "");
      } else {
        const app = await tx.mentorApplication.findUnique({
          where: { id: applicationId },
        });
        if (!app) throw new Error("Application not found");
        targetUserId = app.userId;

        await tx.mentorApplication.update({
          where: { id: applicationId },
          data: {
            status: "REJECTED",
            reviewedAt: new Date(),
          },
        });
      }

      await tx.mentorProfile.upsert({
        where: { userId: targetUserId },
        update: { verificationStatus: "REJECTED" },
        create: {
          userId: targetUserId,
          professionalTitle: "Mentor Applicant",
          yearsExperience: 1,
          bio: "Mentor application under review.",
          verificationStatus: "REJECTED",
        },
      });

      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: "Mentor Application Update",
          message: "Your application to become a verified mentor was not approved at this time.",
          type: "BOOKING_REJECTED",
        },
      });

      return { success: true };
    });
  }
}

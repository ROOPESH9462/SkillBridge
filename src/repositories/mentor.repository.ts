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
      mentorProfile: {
        verificationStatus: "VERIFIED",
      },
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
        mentorProfile: {
          overallRating: "desc",
        },
      },
    });
  }

  static async findMentorById(id: string) {
    return db.user.findFirst({
      where: {
        id,
        role: "MENTOR",
        accountStatus: "ACTIVE",
        mentorProfile: {
          verificationStatus: "VERIFIED",
        },
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

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: app.userId,
          title: "Mentor Application Approved! 🎉",
          message: "Congratulations! Your mentor application has been verified. You can now set your availability and accept mentorship requests.",
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
          message: "Your application to become a verified mentor was not approved at this time. You can re-apply with updated credentials.",
          type: "BOOKING_REJECTED",
        },
      });

      return updatedApp;
    });
  }
}

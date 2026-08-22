import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const Role = {
  LEARNER: "LEARNER",
  MENTOR: "MENTOR",
  ADMIN: "ADMIN",
};

const AccountStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
};

const VerificationStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

const SkillProficiency = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  EXPERT: "EXPERT",
};

const SkillRole = {
  TEACHING: "TEACHING",
  LEARNING: "LEARNING",
};

const BookingStatus = {
  REQUESTED: "REQUESTED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
};

const NotificationType = {
  BOOKING_REQUEST: "BOOKING_REQUEST",
  BOOKING_APPROVED: "BOOKING_APPROVED",
  BOOKING_REJECTED: "BOOKING_REJECTED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  SESSION_COMPLETED: "SESSION_COMPLETED",
  REVIEW_REMINDER: "REVIEW_REMINDER",
  MENTOR_VERIFIED: "MENTOR_VERIFIED",
};

async function main() {
  console.log("🌱 Cleaning database...");
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.mentorshipSession.deleteMany();
  await prisma.mentorAvailability.deleteMany();
  await prisma.skillMilestone.deleteMany();
  await prisma.learnerSkillGoal.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.mentorApplication.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log("🔐 Hashing default passwords...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Skills Taxonomy
  console.log("📚 Creating skills taxonomy...");
  const skillsData = [
    { name: "Next.js", category: "Software Engineering", description: "React Framework for Web Development with App Router & SSR" },
    { name: "React", category: "Software Engineering", description: "UI Component Library for Building Web Interfaces" },
    { name: "System Design", category: "Software Engineering", description: "Scalable Architecture, Microservices, and Load Balancing" },
    { name: "TypeScript", category: "Software Engineering", description: "Typed JavaScript for Large-Scale Applications" },
    { name: "Python", category: "AI & Data", description: "General Purpose Language for ML, Data, and Backend APIs" },
    { name: "FastAPI", category: "AI & Data", description: "Modern, Fast Web Framework for Building APIs in Python" },
    { name: "PyTorch", category: "AI & Data", description: "Deep Learning Framework for Neural Networks" },
    { name: "AWS", category: "Cloud & DevOps", description: "Amazon Web Services Infrastructure & Cloud Architecture" },
    { name: "Docker", category: "Cloud & DevOps", description: "Containerization & Service Isolation" },
    { name: "Kubernetes", category: "Cloud & DevOps", description: "Container Orchestration & Cluster Management" },
    { name: "UI/UX Design", category: "Product & Design", description: "User Experience Design, Wireframing, and Prototyping" },
    { name: "Figma", category: "Product & Design", description: "Collaborative Interface Design & Component Systems" },
    { name: "Go", category: "Backend Engineering", description: "High-Performance Concurrent Backend Services" },
    { name: "PostgreSQL", category: "Backend Engineering", description: "Advanced Open-Source Relational Database" },
    { name: "React Native", category: "Mobile Engineering", description: "Cross-Platform Mobile App Development" },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const created = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skillMap.set(s.name, created.id);
  }

  // 2. Create Admin, Learner, and Generic Test Mentor Accounts
  console.log("👤 Creating Admin, Learner, and Test Mentor accounts...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@skillbridge.dev" },
    update: {},
    create: {
      email: "admin@skillbridge.dev",
      name: "Platform Administrator",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    },
  });

  const learnerUser = await prisma.user.upsert({
    where: { email: "learner@skillbridge.dev" },
    update: {},
    create: {
      email: "learner@skillbridge.dev",
      name: "Siddharth Verma",
      passwordHash: hashedPassword,
      role: Role.LEARNER,
      accountStatus: AccountStatus.ACTIVE,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth",
    },
  });

  const testMentorUser = await prisma.user.upsert({
    where: { email: "mentor@skillbridge.dev" },
    update: {},
    create: {
      email: "mentor@skillbridge.dev",
      name: "Aarav Mehta",
      passwordHash: hashedPassword,
      role: Role.MENTOR,
      accountStatus: AccountStatus.ACTIVE,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    },
  });

  // Create Learner Skill Goals & Milestones
  const nextjsId = skillMap.get("Next.js")!;
  const systemDesignId = skillMap.get("System Design")!;

  const nextGoal = await prisma.learnerSkillGoal.create({
    data: {
      userId: learnerUser.id,
      skillId: nextjsId,
      targetLevel: SkillProficiency.EXPERT,
    },
  });

  await prisma.skillMilestone.createMany({
    data: [
      { goalId: nextGoal.id, title: "App Router & Dynamic Routing", isCompleted: true },
      { goalId: nextGoal.id, title: "React Server Components & Streaming", isCompleted: true },
      { goalId: nextGoal.id, title: "Server Actions & Form Handling", isCompleted: true },
      { goalId: nextGoal.id, title: "Caching & Revalidation Strategies", isCompleted: false },
      { goalId: nextGoal.id, title: "Production Deployment & Monitoring", isCompleted: false },
    ],
  });

  const sysGoal = await prisma.learnerSkillGoal.create({
    data: {
      userId: learnerUser.id,
      skillId: systemDesignId,
      targetLevel: SkillProficiency.EXPERT,
    },
  });

  await prisma.skillMilestone.createMany({
    data: [
      { goalId: sysGoal.id, title: "Load Balancers & Reverse Proxies", isCompleted: true },
      { goalId: sysGoal.id, title: "Database Sharding & Replication", isCompleted: false },
      { goalId: sysGoal.id, title: "Caching Layers (Redis / Memcached)", isCompleted: false },
    ],
  });

  // 3. Create Authentic Fictional Mentors
  console.log("👨‍🏫 Creating Authentic Fictional Mentors...");
  const mentors = [
    {
      userId: testMentorUser.id,
      name: "Aarav Mehta",
      email: "mentor@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      title: "Senior Frontend Architect",
      yearsExp: 8,
      bio: "Frontend architect specializing in large-scale Next.js applications, web performance optimization, and modular UI component design systems.",
      github: "https://github.com/aaravmehta",
      linkedin: "https://linkedin.com/in/aaravmehta-arch",
      rating: 4.95,
      reviewCount: 42,
      skills: [
        { name: "Next.js", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "React", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "TypeScript", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "System Design", prof: SkillProficiency.INTERMEDIATE, yrs: 5 },
      ],
    },
    {
      name: "Priya Nair",
      email: "priya.nair@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      title: "Lead Machine Learning Engineer",
      yearsExp: 7,
      bio: "ML engineer focusing on productionizing deep learning models, high-performance FastAPI backends, and MLOps deployment pipelines.",
      github: "https://github.com/priyanair-ml",
      linkedin: "https://linkedin.com/in/priyanair-ai",
      rating: 4.92,
      reviewCount: 38,
      skills: [
        { name: "Python", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "FastAPI", prof: SkillProficiency.EXPERT, yrs: 5 },
        { name: "PyTorch", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "System Design", prof: SkillProficiency.INTERMEDIATE, yrs: 4 },
      ],
    },
    {
      name: "Rohan Kapoor",
      email: "rohan.kapoor@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      title: "Senior Cloud & DevOps Specialist",
      yearsExp: 9,
      bio: "Infrastructure expert specializing in AWS Kubernetes clusters, Terraform infrastructure-as-code, and automated CI/CD security pipelines.",
      github: "https://github.com/rohankapoor-ops",
      linkedin: "https://linkedin.com/in/rohankapoor-cloud",
      rating: 4.88,
      reviewCount: 29,
      skills: [
        { name: "AWS", prof: SkillProficiency.EXPERT, yrs: 9 },
        { name: "Docker", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "Kubernetes", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "System Design", prof: SkillProficiency.EXPERT, yrs: 8 },
      ],
    },
    {
      name: "Ananya Rao",
      email: "ananya.rao@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      title: "Principal Product Designer",
      yearsExp: 6,
      bio: "Passionate product designer helping developers transition into intuitive UX design, design system tokens, and seamless visual hierarchy.",
      github: "https://github.com/ananyarao-design",
      linkedin: "https://linkedin.com/in/ananyarao-ui",
      rating: 4.97,
      reviewCount: 51,
      skills: [
        { name: "UI/UX Design", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "Figma", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "React", prof: SkillProficiency.INTERMEDIATE, yrs: 3 },
      ],
    },
    {
      name: "Vikram Shah",
      email: "vikram.shah@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      title: "Staff Backend Systems Engineer",
      yearsExp: 10,
      bio: "Distributed systems engineer passionate about low-latency Go microservices, database index optimization, and event-driven architecture.",
      github: "https://github.com/vikramshah-dev",
      linkedin: "https://linkedin.com/in/vikramshah-backend",
      rating: 4.90,
      reviewCount: 33,
      skills: [
        { name: "Go", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "PostgreSQL", prof: SkillProficiency.EXPERT, yrs: 10 },
        { name: "System Design", prof: SkillProficiency.EXPERT, yrs: 10 },
        { name: "Docker", prof: SkillProficiency.EXPERT, yrs: 7 },
      ],
    },
  ];

  for (const m of mentors) {
    let user;
    if (m.userId) {
      user = await prisma.user.findUnique({ where: { id: m.userId } });
    } else {
      user = await prisma.user.create({
        data: {
          email: m.email,
          name: m.name,
          passwordHash: hashedPassword,
          role: Role.MENTOR,
          accountStatus: AccountStatus.ACTIVE,
          avatar: m.avatar,
        },
      });
    }

    if (user) {
      await prisma.mentorProfile.create({
        data: {
          userId: user.id,
          professionalTitle: m.title,
          yearsExperience: m.yearsExp,
          bio: m.bio,
          githubUrl: m.github,
          linkedinUrl: m.linkedin,
          overallRating: m.rating,
          reviewCount: m.reviewCount,
          verificationStatus: VerificationStatus.VERIFIED,
          verificationDate: new Date(),
        },
      });

      for (const sk of m.skills) {
        const sId = skillMap.get(sk.name);
        if (sId) {
          await prisma.userSkill.create({
            data: {
              userId: user.id,
              skillId: sId,
              role: SkillRole.TEACHING,
              proficiency: sk.prof,
              yearsExperience: sk.yrs,
              isVerified: true,
            },
          });
        }
      }

      // Weekly Availability Slots (Mon, Wed, Fri)
      for (const day of [1, 3, 5]) {
        await prisma.mentorAvailability.create({
          data: {
            mentorId: user.id,
            dayOfWeek: day,
            startTime: "10:00",
            endTime: "14:00",
            isActive: true,
          },
        });
      }

      // Sample Completed Session & Verified Review for Aarav Mehta
      if (m.name === "Aarav Mehta") {
        const session = await prisma.mentorshipSession.create({
          data: {
            mentorId: user.id,
            learnerId: learnerUser.id,
            skillId: nextjsId,
            scheduledStart: new Date(Date.now() - 86400000 * 2), // 2 days ago
            scheduledEnd: new Date(Date.now() - 86400000 * 2 + 2700000), // +45 mins
            durationMinutes: 45,
            status: BookingStatus.COMPLETED,
            topic: "Next.js App Router Caching & Revalidation Deep Dive",
            notes: "Covered staled-while-revalidate patterns, Server Actions error boundaries, and ISR revalidation triggers.",
            meetingLink: "https://meet.skillbridge.dev/session-aarav-siddharth",
          },
        });

        await prisma.review.create({
          data: {
            sessionId: session.id,
            authorId: learnerUser.id,
            targetUserId: user.id,
            rating: 5,
            comment: "Aarav provided unmatched clarity on React Server Components caching! The architectural diagram we made together cleared up weeks of confusion.",
          },
        });

        // Sample Notification
        await prisma.notification.create({
          data: {
            userId: learnerUser.id,
            title: "Session Completed & Verified",
            message: "Your mentorship session with Aarav Mehta has been completed. Leave a review!",
            type: NotificationType.SESSION_COMPLETED,
            isRead: true,
          },
        });
      }
    }
  }

  console.log("✅ Idempotent seed database populated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
const prisma = connectionUrl
  ? new PrismaClient({ datasources: { db: { url: connectionUrl } } })
  : new PrismaClient();

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
  if (process.env.RESET_DB === "true") {
    console.log("🌱 Resetting database (RESET_DB=true)...");
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
  } else {
    console.log("🌱 Checking database state (preserving all existing users and sessions)...");
  }

  console.log("🔐 Hashing default passwords...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Real-World Skills Taxonomy
  console.log("📚 Upserting skills taxonomy...");
  const skillsData = [
    { name: "Next.js", category: "Software Engineering", description: "React Framework for Web Development with App Router & SSR" },
    { name: "React", category: "Software Engineering", description: "UI Component Library for Building Modern Web Interfaces" },
    { name: "System Design", category: "Software Engineering", description: "Scalable Architecture, Microservices, and Distributed Systems" },
    { name: "TypeScript", category: "Software Engineering", description: "Typed JavaScript for Production Applications" },
    { name: "Python", category: "AI & Data", description: "General Purpose Language for ML, Data Pipelines, and APIs" },
    { name: "FastAPI", category: "AI & Data", description: "Modern, High-Performance Asynchronous Web Framework for Python" },
    { name: "PyTorch", category: "AI & Data", description: "Deep Learning & AI Model Development Framework" },
    { name: "AWS", category: "Cloud & DevOps", description: "Amazon Web Services Infrastructure & Cloud Solutions" },
    { name: "Docker", category: "Cloud & DevOps", description: "Containerization & Service Deployment Isolation" },
    { name: "Kubernetes", category: "Cloud & DevOps", description: "Container Orchestration & Automated Cluster Management" },
    { name: "UI/UX Design", category: "Product & Design", description: "User Interface Design, Wireframing & User Research" },
    { name: "Figma", category: "Product & Design", description: "Collaborative Interface Design & Component Tokens" },
    { name: "Go", category: "Backend Engineering", description: "High-Concurrency Low-Latency Backend Services" },
    { name: "PostgreSQL", category: "Backend Engineering", description: "Advanced Enterprise Open-Source Relational Database" },
    { name: "Node.js", category: "Software Engineering", description: "Asynchronous Event-Driven JavaScript Runtime" },
    { name: "GraphQL", category: "Backend Engineering", description: "Flexible API Query Language & Middleware Layer" },
    { name: "Cybersecurity", category: "Security & Cloud", description: "Web Application Security, OWASP & Penetration Testing" },
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

  // 2. Create Core Admin, Learner, and Test Mentor Accounts
  console.log("👤 Upserting Core System Accounts...");
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

  // Learner Active Goals & Milestones
  const nextjsId = skillMap.get("Next.js")!;
  const systemDesignId = skillMap.get("System Design")!;

  const nextGoal = await prisma.learnerSkillGoal.upsert({
    where: {
      userId_skillId: {
        userId: learnerUser.id,
        skillId: nextjsId,
      },
    },
    update: {},
    create: {
      userId: learnerUser.id,
      skillId: nextjsId,
      targetLevel: SkillProficiency.EXPERT,
    },
  });

  const existingMilestones = await prisma.skillMilestone.findMany({
    where: { goalId: nextGoal.id },
  });

  if (existingMilestones.length === 0) {
    await prisma.skillMilestone.createMany({
      data: [
        { goalId: nextGoal.id, title: "App Router & Dynamic Server Routing", isCompleted: true },
        { goalId: nextGoal.id, title: "React Server Components & Suspense Streaming", isCompleted: true },
        { goalId: nextGoal.id, title: "Server Actions & Zod Form Validation", isCompleted: true },
        { goalId: nextGoal.id, title: "Stale-While-Revalidate & ISR Caching Strategies", isCompleted: false },
        { goalId: nextGoal.id, title: "Production Deployment & Performance Monitoring", isCompleted: false },
      ],
    });
  }

  // 3. Create Authentic Fictional Industry Mentors
  console.log("👨‍🏫 Upserting Industry Mentors...");
  const mentors = [
    {
      userId: testMentorUser.id,
      name: "Aarav Mehta",
      email: "mentor@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
      title: "Staff Frontend Architect (ex-Meta)",
      yearsExp: 9,
      bio: "Staff Frontend Architect specializing in large-scale Next.js 14 applications, web performance optimization, and modular UI component design systems.",
      github: "https://github.com/aaravmehta",
      linkedin: "https://linkedin.com/in/aaravmehta-arch",
      rating: 4.96,
      reviewCount: 48,
      skills: [
        { name: "Next.js", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "React", prof: SkillProficiency.EXPERT, yrs: 9 },
        { name: "TypeScript", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "System Design", prof: SkillProficiency.EXPERT, yrs: 6 },
      ],
    },
    {
      name: "Priya Nair",
      email: "priya.nair@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      title: "Principal ML & AI Lead (AWS)",
      yearsExp: 8,
      bio: "Machine Learning Lead focusing on productionizing deep learning models, high-performance FastAPI backends, and MLOps deployment pipelines.",
      github: "https://github.com/priyanair-ml",
      linkedin: "https://linkedin.com/in/priyanair-ai",
      rating: 4.93,
      reviewCount: 41,
      skills: [
        { name: "Python", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "FastAPI", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "PyTorch", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "System Design", prof: SkillProficiency.INTERMEDIATE, yrs: 5 },
      ],
    },
    {
      name: "Rohan Kapoor",
      email: "rohan.kapoor@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
      title: "Senior DevOps Lead (Kubernetes CKA)",
      yearsExp: 10,
      bio: "Infrastructure architect specializing in AWS Kubernetes clusters, Terraform infrastructure-as-code, and automated CI/CD security pipelines.",
      github: "https://github.com/rohankapoor-ops",
      linkedin: "https://linkedin.com/in/rohankapoor-cloud",
      rating: 4.89,
      reviewCount: 35,
      skills: [
        { name: "AWS", prof: SkillProficiency.EXPERT, yrs: 10 },
        { name: "Docker", prof: SkillProficiency.EXPERT, yrs: 9 },
        { name: "Kubernetes", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "System Design", prof: SkillProficiency.EXPERT, yrs: 8 },
      ],
    },
    {
      name: "Ananya Rao",
      email: "ananya.rao@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      title: "Principal Product Designer",
      yearsExp: 7,
      bio: "Passionate product designer helping developers master intuitive UI/UX design principles, Figma design tokens, and seamless visual hierarchy.",
      github: "https://github.com/ananyarao-design",
      linkedin: "https://linkedin.com/in/ananyarao-ui",
      rating: 4.98,
      reviewCount: 56,
      skills: [
        { name: "UI/UX Design", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "Figma", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "React", prof: SkillProficiency.INTERMEDIATE, yrs: 4 },
      ],
    },
    {
      name: "Vikram Shah",
      email: "vikram.shah@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      title: "Staff Backend Engineer (Uber)",
      yearsExp: 11,
      bio: "Distributed systems engineer passionate about low-latency Go microservices, PostgreSQL index tuning, and high-throughput event-driven systems.",
      github: "https://github.com/vikramshah-dev",
      linkedin: "https://linkedin.com/in/vikramshah-backend",
      rating: 4.91,
      reviewCount: 39,
      skills: [
        { name: "Go", prof: SkillProficiency.EXPERT, yrs: 9 },
        { name: "PostgreSQL", prof: SkillProficiency.EXPERT, yrs: 11 },
        { name: "System Design", prof: SkillProficiency.EXPERT, yrs: 11 },
        { name: "Docker", prof: SkillProficiency.EXPERT, yrs: 8 },
      ],
    },
    {
      name: "Devansh Joshi",
      email: "devansh.joshi@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Devansh",
      title: "Senior Full Stack Specialist (Stripe)",
      yearsExp: 7,
      bio: "Full stack specialist guiding engineers through Node.js asynchronous APIs, GraphQL schemas, and scalable TypeScript full-stack applications.",
      github: "https://github.com/devansh-stripe",
      linkedin: "https://linkedin.com/in/devansh-joshi",
      rating: 4.87,
      reviewCount: 31,
      skills: [
        { name: "Node.js", prof: SkillProficiency.EXPERT, yrs: 7 },
        { name: "GraphQL", prof: SkillProficiency.EXPERT, yrs: 5 },
        { name: "TypeScript", prof: SkillProficiency.EXPERT, yrs: 6 },
        { name: "React", prof: SkillProficiency.EXPERT, yrs: 6 },
      ],
    },
    {
      name: "Kavya Patel",
      email: "kavya.patel@skillbridge.dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya",
      title: "Security Architect (Cloudflare)",
      yearsExp: 8,
      bio: "Cybersecurity specialist focused on web application security, OWASP top 10 vulnerability prevention, and cloud security architecture.",
      github: "https://github.com/kavyapatel-sec",
      linkedin: "https://linkedin.com/in/kavyapatel-security",
      rating: 4.94,
      reviewCount: 44,
      skills: [
        { name: "Cybersecurity", prof: SkillProficiency.EXPERT, yrs: 8 },
        { name: "AWS", prof: SkillProficiency.INTERMEDIATE, yrs: 5 },
        { name: "Python", prof: SkillProficiency.INTERMEDIATE, yrs: 6 },
      ],
    },
  ];

  for (const m of mentors) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: m.name,
        passwordHash: hashedPassword,
        role: Role.MENTOR,
        accountStatus: AccountStatus.ACTIVE,
        avatar: m.avatar,
      },
    });

    await prisma.mentorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
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
        await prisma.userSkill.upsert({
          where: {
            userId_skillId_role: {
              userId: user.id,
              skillId: sId,
              role: SkillRole.TEACHING,
            },
          },
          update: {},
          create: {
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

    // Weekly Recurring Availability Slots (Mon, Wed, Fri)
    const existingAvail = await prisma.mentorAvailability.findFirst({
      where: { mentorId: user.id },
    });

    if (!existingAvail) {
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
    }
  }

  // 4. Create Pending Application for Admin Review Demo
  console.log("📝 Upserting Demo Pending Application...");
  const applicantUser = await prisma.user.upsert({
    where: { email: "applicant@skillbridge.dev" },
    update: {},
    create: {
      email: "applicant@skillbridge.dev",
      name: "Neha Sharma",
      passwordHash: hashedPassword,
      role: Role.LEARNER,
      accountStatus: AccountStatus.ACTIVE,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    },
  });

  const existingApp = await prisma.mentorApplication.findFirst({
    where: { userId: applicantUser.id },
  });

  if (!existingApp) {
    await prisma.mentorApplication.create({
      data: {
        userId: applicantUser.id,
        professionalTitle: "Lead AI Systems Engineer",
        yearsExperience: 6,
        skills: "Python, FastAPI, PyTorch, System Design",
        bio: "Building enterprise generative AI search pipelines and model evaluation suites. Excited to mentor junior AI engineers.",
        portfolioUrl: "https://github.com/nehasharma-ai",
        linkedinUrl: "https://linkedin.com/in/nehasharma-ai",
        reasonForMentoring: "I want to help upcoming engineers avoid common pitfalls when deploying machine learning models to production.",
        status: VerificationStatus.PENDING,
      },
    });
  }

  console.log("✅ Database verified and populated without overwriting user data!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

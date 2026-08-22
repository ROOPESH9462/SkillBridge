import { db } from "@/lib/db";

const DEFAULT_MILESTONE_TEMPLATES: Record<string, string[]> = {
  "Next.js": [
    "App Router Architecture & Nested Layouts",
    "React Server Components & Streaming",
    "Server Actions & Form Validation",
    "Caching & ISR Revalidation Strategies",
    "Production Deployment & Monitoring",
  ],
  "System Design": [
    "Functional & Non-Functional Requirements Gathering",
    "API Design & Scalable Load Balancing",
    "Database Sharding, Replication & Indexing",
    "Distributed Caching (Redis / Memcached)",
    "Message Queues & Microservice Resilience",
  ],
  Python: [
    "Python Fundamentals & Data Structures",
    "Object-Oriented & Asynchronous Programming",
    "FastAPI REST API Development",
    "Database Integration with SQL ORMs",
    "Production API Containerization & Deployment",
  ],
  React: [
    "Component Lifecycle & Core React Hooks",
    "Global State Management (Zustand / Context)",
    "Custom Hooks & Performance Optimization",
    "Reusable UI Token Systems & Accessibility",
  ],
  AWS: [
    "AWS IAM & Cloud Security Policies",
    "EC2 Computing & VPC Network Configuration",
    "S3 Bucket Storage & CloudFront CDN",
    "Serverless Lambda Functions & API Gateway",
    "Infrastructure as Code with Terraform",
  ],
  Docker: [
    "Container Basics & Efficient Dockerfiles",
    "Multi-Stage Builds for Minimal Images",
    "Docker Compose Service Orchestration",
    "Container Volume Persistence & Networking",
  ],
};

const GENERIC_MILESTONE_TEMPLATE = [
  "Fundamentals & Core Syntax Mastery",
  "Building Practical Application Projects",
  "Advanced Optimization & Best Practices",
  "Production Testing & Deployment Readiness",
];

export class GoalRepository {
  static async findGoalsByUserId(userId: string) {
    return db.learnerSkillGoal.findMany({
      where: { userId },
      include: {
        skill: true,
        milestones: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findGoalById(goalId: string) {
    return db.learnerSkillGoal.findUnique({
      where: { id: goalId },
      include: {
        skill: true,
        milestones: true,
      },
    });
  }

  static async findMilestoneById(milestoneId: string) {
    return db.skillMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        goal: {
          include: { skill: true, milestones: true },
        },
      },
    });
  }

  static async createGoal(userId: string, data: { skillId: string; targetLevel?: string }) {
    // Check if goal already exists for this skill
    const existing = await db.learnerSkillGoal.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: data.skillId,
        },
      },
    });

    if (existing) {
      throw new Error("You already have an active learning goal for this skill.");
    }

    const skill = await db.skill.findUnique({ where: { id: data.skillId } });
    if (!skill) throw new Error("Skill not found");

    const milestoneTitles = DEFAULT_MILESTONE_TEMPLATES[skill.name] || GENERIC_MILESTONE_TEMPLATE;

    return db.learnerSkillGoal.create({
      data: {
        userId,
        skillId: data.skillId,
        targetLevel: data.targetLevel || "EXPERT",
        milestones: {
          create: milestoneTitles.map((title) => ({
            title,
            isCompleted: false,
          })),
        },
      },
      include: {
        skill: true,
        milestones: true,
      },
    });
  }

  static async toggleMilestone(milestoneId: string, userId: string) {
    const milestone = await this.findMilestoneById(milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    // Enforce ownership check
    if (milestone.goal.userId !== userId) {
      throw new Error("FORBIDDEN: You do not own this skill goal.");
    }

    const nextCompleted = !milestone.isCompleted;

    // Toggle target milestone
    await db.skillMilestone.update({
      where: { id: milestoneId },
      data: { isCompleted: nextCompleted },
    });

    // Fetch updated milestones for the goal
    const updatedGoal = await db.learnerSkillGoal.findUnique({
      where: { id: milestone.goalId },
      include: { milestones: true, skill: true },
    });

    if (!updatedGoal) throw new Error("Goal not found");

    const total = updatedGoal.milestones.length;
    const completedCount = updatedGoal.milestones.filter((m) => m.isCompleted).length;
    const allCompleted = total > 0 && completedCount === total;

    // If all milestones completed, update goal.isCompleted = true
    if (updatedGoal.isCompleted !== allCompleted) {
      await db.learnerSkillGoal.update({
        where: { id: updatedGoal.id },
        data: { isCompleted: allCompleted },
      });
    }

    return {
      milestoneId,
      isCompleted: nextCompleted,
      goalId: updatedGoal.id,
      goalCompleted: allCompleted,
      completedCount,
      totalCount: total,
      progressPct: Math.round((completedCount / total) * 100),
    };
  }

  static async deleteGoal(goalId: string, userId: string) {
    const goal = await db.learnerSkillGoal.findUnique({ where: { id: goalId } });
    if (!goal) throw new Error("Goal not found");

    if (goal.userId !== userId) {
      throw new Error("FORBIDDEN: You do not own this skill goal.");
    }

    return db.learnerSkillGoal.delete({
      where: { id: goalId },
    });
  }
}

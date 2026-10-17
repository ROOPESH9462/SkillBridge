import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["LEARNER", "MENTOR", "ADMIN"]).default("LEARNER"),
  adminSecret: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  skillId: z.string().min(1, "Skill is required"),
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
});

export const mentorApplicationSchema = z.object({
  professionalTitle: z.string().min(3, "Title must be at least 3 characters"),
  yearsExperience: z.number().min(1, "Experience must be at least 1 year"),
  skills: z.string().min(3, "Please specify your teaching skills"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  reasonForMentoring: z.string().min(10, "Please provide your reason for mentoring"),
});

export const reviewSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["LEARNER", "MENTOR"]).default("LEARNER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  mentorId: z.string().uuid("Invalid mentor ID"),
  skillId: z.string().uuid("Invalid skill ID"),
  scheduledStart: z.string().datetime("Invalid ISO date string"),
  scheduledEnd: z.string().datetime("Invalid ISO date string"),
  topic: z.string().min(5, "Topic must be at least 5 characters"),
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

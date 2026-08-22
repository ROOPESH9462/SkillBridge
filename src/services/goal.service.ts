import { GoalRepository } from "@/repositories/goal.repository";
import { z } from "zod";

export const createGoalSchema = z.object({
  skillId: z.string().uuid("Invalid skill ID"),
  targetLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]).default("EXPERT"),
});

export class GoalService {
  static async getUserGoals(userId: string) {
    const rawGoals = await GoalRepository.findGoalsByUserId(userId);

    return rawGoals.map((goal) => {
      const total = goal.milestones.length;
      const completed = goal.milestones.filter((m) => m.isCompleted).length;
      const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: goal.id,
        skillId: goal.skill.id,
        skillName: goal.skill.name,
        category: goal.skill.category,
        targetLevel: goal.targetLevel,
        isCompleted: goal.isCompleted,
        totalMilestones: total,
        completedMilestones: completed,
        progressPct,
        milestones: goal.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          isCompleted: m.isCompleted,
        })),
      };
    });
  }

  static async createGoal(userId: string, input: z.infer<typeof createGoalSchema>) {
    const validated = createGoalSchema.parse(input);
    return GoalRepository.createGoal(userId, validated);
  }

  static async toggleMilestone(userId: string, milestoneId: string) {
    return GoalRepository.toggleMilestone(milestoneId, userId);
  }

  static async deleteGoal(userId: string, goalId: string) {
    return GoalRepository.deleteGoal(goalId, userId);
  }
}

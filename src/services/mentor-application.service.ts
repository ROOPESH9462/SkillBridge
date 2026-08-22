import { MentorRepository } from "@/repositories/mentor.repository";

export class MentorApplicationService {
  static async getApplications(status?: string) {
    return MentorRepository.findAllApplications(status);
  }

  static async reviewApplication(applicationId: string, action: "APPROVE" | "REJECT") {
    if (action === "APPROVE") {
      return MentorRepository.approveApplication(applicationId);
    } else if (action === "REJECT") {
      return MentorRepository.rejectApplication(applicationId);
    } else {
      throw new Error("Invalid review action. Must be APPROVE or REJECT.");
    }
  }
}

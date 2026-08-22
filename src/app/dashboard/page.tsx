import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function DashboardRootPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.accountStatus === "SUSPENDED" || session.accountStatus === "DEACTIVATED") {
    redirect("/login?error=suspended");
  }

  if (session.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (session.role === "MENTOR") {
    redirect("/dashboard/mentor");
  } else {
    redirect("/dashboard/learner");
  }
}

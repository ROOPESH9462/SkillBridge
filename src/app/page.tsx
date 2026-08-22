import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
}

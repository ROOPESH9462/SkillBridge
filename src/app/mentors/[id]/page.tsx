import React from "react";
import { notFound } from "next/navigation";
import { MentorService } from "@/services/mentor.service";
import { MentorProfileView } from "@/components/MentorProfileView";

export default async function MentorDetailPage({ params }: { params: { id: string } }) {
  const mentor = await MentorService.getMentorDetails(params.id);

  if (!mentor) {
    notFound();
  }

  return <MentorProfileView mentor={mentor} />;
}

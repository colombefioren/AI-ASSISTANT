import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { getSession } from "@/lib/auth";
import { recentSessions } from "@/lib/sessions";

export const metadata: Metadata = {
  title: "Interview room",
};

export default async function InterviewPage() {
  // Middleware already guards this route; checking again here keeps the page
  // safe even if the matcher changes.
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/interview");

  const history = await recentSessions(Number(session.user.id));
  return <InterviewRoom userName={session.user.name ?? "Candidate"} initialHistory={history} />;
}

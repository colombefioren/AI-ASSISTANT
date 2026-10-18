import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReportView } from "@/components/interview/ReportView";
import { Transcript } from "@/components/interview/Transcript";
import { Logo } from "@/components/ui/Logo";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { interviewers, isInterviewerId } from "@/lib/interviewers";
import { interviewLanguages } from "@/lib/languages";
import { findSession } from "@/lib/sessions";

export const metadata: Metadata = {
  title: "Session report",
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?callbackUrl=/sessions/${encodeURIComponent(id)}`);

  const record = await findSession(Number(session.user.id), id);
  if (!record) notFound();

  const name = isInterviewerId(record.interviewer) ? interviewers[record.interviewer].displayName : "Interviewer";

  return (
    <div className="min-h-[100dvh]">
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <Logo />
        <Link href="/interview" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft aria-hidden />
          Interview room
        </Link>
      </header>
      <main className="mx-auto grid max-w-5xl gap-12 px-4 py-10 sm:px-6 lg:py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Session with {name}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {formatDate(record.createdAt.toISOString())}, in {interviewLanguages[record.report.language ?? "en"].label}
          </p>
        </div>
        <ReportView report={record.report} />
        <section aria-labelledby="transcript-heading" className="border-t pt-10">
          <h2 id="transcript-heading" className="text-lg font-semibold tracking-tight">
            Transcript
          </h2>
          <div className="mt-4 max-w-3xl">
            <Transcript lines={record.transcript} interviewerName={name} />
          </div>
        </section>
      </main>
    </div>
  );
}

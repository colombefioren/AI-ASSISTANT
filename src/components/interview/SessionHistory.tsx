import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/format";
import { interviewers, isInterviewerId } from "@/lib/interviewers";
import type { SessionSummary } from "@/lib/sessions";

export function SessionHistory({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length === 0) return null;
  return (
    <section aria-labelledby="history-heading" className="py-6">
      <h2 id="history-heading" className="text-sm font-semibold">
        Past sessions
      </h2>
      <ul className="mt-3 grid gap-1">
        {sessions.map((session) => (
          <li key={session.id}>
            <Link
              href={`/sessions/${session.id}`}
              className="group -mx-3 flex items-center justify-between gap-3 rounded-field px-3 py-2.5 transition-colors hover:bg-surface-raised"
            >
              <span>
                <span className="block text-sm font-medium">
                  {isInterviewerId(session.interviewer) ? interviewers[session.interviewer].name : "Interview"} on{" "}
                  {formatDate(session.createdAt)}
                </span>
                <span className="block text-xs text-ink-muted">
                  {formatDuration(session.durationSec)}, {session.answers} {session.answers === 1 ? "answer" : "answers"}
                </span>
              </span>
              <ChevronRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

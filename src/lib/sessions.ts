import "server-only";
import prisma from "@/lib/db";
import type { SessionReport, TranscriptLine } from "@/lib/report";

export interface SessionSummary {
  id: string;
  interviewer: string;
  createdAt: string;
  durationSec: number;
  answers: number;
}

export async function recentSessions(userId: number, take = 8): Promise<SessionSummary[]> {
  const rows = await prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, interviewer: true, createdAt: true, durationSec: true, report: true },
  });
  return rows.map((row) => ({
    id: row.id,
    interviewer: row.interviewer,
    createdAt: row.createdAt.toISOString(),
    durationSec: row.durationSec,
    answers: (row.report as unknown as SessionReport).answers ?? 0,
  }));
}

/** Scoped to the owner so one user can never read another user's session. */
export async function findSession(userId: number, id: string) {
  const row = await prisma.interviewSession.findFirst({ where: { id, userId } });
  if (!row) return null;
  return {
    ...row,
    transcript: row.transcript as unknown as TranscriptLine[],
    report: row.report as unknown as SessionReport,
  };
}

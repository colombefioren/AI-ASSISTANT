import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { interviewerIds } from "@/lib/interviewers";
import { languageIds, type InterviewLanguage } from "@/lib/languages";
import { rateLimit } from "@/lib/rate-limit";
import { buildReport, transcriptLineSchema } from "@/lib/report";

const bodySchema = z.object({
  interviewer: z.enum(interviewerIds as [string, ...string[]]),
  durationSec: z.number().int().min(0).max(4 * 60 * 60),
  language: z.enum(languageIds as [InterviewLanguage, ...InterviewLanguage[]]).default("en"),
  transcript: z.array(transcriptLineSchema).min(1).max(400),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to save sessions." }, { status: 401 });

  const userId = Number(session.user.id);
  if (!rateLimit(`sessions:${userId}`, 30, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many sessions saved this hour." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid session data." }, { status: 400 });

  const { interviewer, durationSec, transcript, language } = parsed.data;
  // The report is always computed on the server so stored results cannot be forged.
  const report = buildReport(transcript, durationSec, language);

  const saved = await prisma.interviewSession.create({
    data: { userId, interviewer, durationSec, transcript, report: report as object },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ id: saved.id, createdAt: saved.createdAt, report }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getConversationCredentials } from "@/lib/agents";
import { getSession } from "@/lib/auth";
import { interviewers, isInterviewerId } from "@/lib/interviewers";
import { englishOverrides } from "@/lib/interview-script";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to start an interview." }, { status: 401 });
  }

  const interviewer = new URL(req.url).searchParams.get("interviewer");
  if (!isInterviewerId(interviewer)) {
    return NextResponse.json({ error: "Unknown interviewer." }, { status: 400 });
  }

  try {
    const credentials = await getConversationCredentials(interviewer);
    const overrides =
      process.env.ELEVENLABS_ALLOW_OVERRIDES === "true"
        ? englishOverrides(interviewers[interviewer].name)
        : undefined;
    return NextResponse.json({ ...credentials, overrides }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not create conversation credentials", error);
    return NextResponse.json({ error: "The interviewer is unavailable right now." }, { status: 502 });
  }
}

import type { TranscriptLine } from "@/lib/report";

/** A short example session used to preview the report on the landing page. */
export const sampleTranscript: TranscriptLine[] = [
  { id: "q1", speaker: "interviewer", at: 2000, text: "Thanks for joining. Which role are you interviewing for?" },
  { id: "a1", speaker: "candidate", at: 6000, text: "A product designer role on a mobile banking team." },
  {
    id: "q2",
    speaker: "interviewer",
    at: 11000,
    text: "Tell me about a time you had to change a design late in a project.",
  },
  {
    id: "a2",
    speaker: "candidate",
    at: 16000,
    text: "Um, so at my last job we were two weeks from launch when support data showed people were, like, abandoning the transfer flow at the confirmation step. I ran five quick usability calls, found the fee wording was confusing, and rewrote the screen with engineering over two days. We shipped on time and drop-off on that step went down about thirty percent in the first month.",
  },
  { id: "q3", speaker: "interviewer", at: 52000, text: "What would you do differently next time?" },
  {
    id: "a3",
    speaker: "candidate",
    at: 57000,
    text: "I think I would, you know, get support data into design reviews from the start. We basically only looked at it after the fact, and I'd like the team to catch that kind of issue before it reaches customers.",
  },
];

export type Speaker = "interviewer" | "candidate";

export interface TranscriptLine {
  id: string;
  speaker: Speaker;
  text: string;
  /** Milliseconds since the session started. */
  at: number;
}

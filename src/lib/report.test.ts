import { describe, expect, it } from "vitest";
import { buildReport, type TranscriptLine } from "./report";
import { sampleTranscript } from "./sample-session";

const line = (speaker: TranscriptLine["speaker"], text: string, i: number): TranscriptLine => ({
  id: `${speaker}-${i}`,
  speaker,
  text,
  at: i * 1000,
});

describe("buildReport", () => {
  it("asks for a microphone check when the candidate never answered", () => {
    const report = buildReport([line("interviewer", "Tell me about yourself.", 0)], 30);
    expect(report.answers).toBe(0);
    expect(report.improvements[0]).toMatch(/No answers were captured/);
  });

  it("does not count verb uses of like as fillers", () => {
    const report = buildReport([line("candidate", "I'd like to join a team that looks like this one.", 1)], 10);
    expect(report.topFillers.find((f) => f.phrase === "like")).toBeUndefined();
  });

  it("counts filler words per 100 words", () => {
    const report = buildReport([line("candidate", "um so um I basically um did it", 1)], 10);
    expect(report.topFillers[0]).toEqual({ phrase: "um", count: 3 });
    expect(report.fillersPer100).toBeCloseTo((4 / 8) * 100, 1);
  });

  it("rewards long answers that end in a measurable result", () => {
    const answer =
      "When our onboarding flow was losing new users I interviewed ten customers, mapped where they dropped off, and rebuilt the first screen with our engineers. I ran the experiment for three weeks and activation increased 18% while support tickets were reduced by a third.";
    const report = buildReport([line("interviewer", "Tell me about a win.", 0), line("candidate", answer, 1)], 90);
    expect(report.outcomeRate).toBe(1);
    expect(report.strengths.some((s) => s.includes("concrete result"))).toBe(true);
  });

  it("flags answers that lean on we instead of I", () => {
    const answer =
      "We planned it together, we built the service, we tested our ideas, and we shipped our release when we felt our team was ready for it.";
    const report = buildReport([line("candidate", answer, 1)], 20);
    expect(report.ownership).toBeLessThan(0.55);
    expect(report.improvements.some((s) => s.includes('"we"'))).toBe(true);
  });

  it("produces a stable report for the landing page sample", () => {
    const report = buildReport(sampleTranscript, 615);
    expect(report.answers).toBe(3);
    expect(report.strengths.length + report.improvements.length).toBeGreaterThan(2);
  });
});

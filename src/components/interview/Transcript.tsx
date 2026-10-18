"use client";

import { useEffect, useRef } from "react";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TranscriptLine } from "./types";

interface TranscriptProps {
  lines: TranscriptLine[];
  interviewerName: string;
  /** Keep the newest line in view while a session is live. */
  follow?: boolean;
}

export function Transcript({ lines, interviewerName, follow = false }: TranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (follow) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [lines.length, follow]);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 py-8">
        <p className="text-sm font-medium text-ink">No transcript yet</p>
        <p className="max-w-[32ch] text-sm leading-relaxed text-ink-muted">
          Start the interview and everything you and {interviewerName} say shows up here.
        </p>
      </div>
    );
  }

  return (
    <ol className="grid gap-5 py-2" aria-label="Transcript">
      {lines.map((line) => (
        <li key={line.id} className="grid gap-1">
          <div className="flex items-baseline gap-2 text-xs">
            <span className={cn("font-medium", line.speaker === "interviewer" ? "text-accent" : "text-ink")}>
              {line.speaker === "interviewer" ? interviewerName : "You"}
            </span>
            <span className="font-mono text-ink-muted">{formatClock(line.at)}</span>
          </div>
          <p className="text-[15px] leading-relaxed text-ink">{line.text}</p>
        </li>
      ))}
      <div ref={endRef} />
    </ol>
  );
}

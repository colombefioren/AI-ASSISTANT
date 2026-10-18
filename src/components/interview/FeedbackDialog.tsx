"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaveState } from "./InterviewRoom";
import { ReportView } from "./ReportView";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  state: SaveState;
  interviewerName: string;
}

/** The original "Show feedback" popup, now backed by the real session report. */
export function FeedbackDialog({ open, onClose, onRetry, state, interviewerName }: FeedbackDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="feedback-title"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-white/10 bg-surface p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-6">
        <div>
          <h2 id="feedback-title" className="text-xl font-semibold tracking-tight">
            Your interview feedback
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Session with {interviewerName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close feedback">
          <X aria-hidden />
        </Button>
      </div>

      <div className="max-h-[70dvh] overflow-y-auto p-6">
        {state.status === "saving" && (
          <div className="grid gap-4" aria-busy>
            <p className="text-sm text-ink-muted">Analysing your answers</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((key) => (
                <div key={key} className="h-14 animate-pulse rounded-xl bg-surface-raised" />
              ))}
            </div>
            <div className="h-28 animate-pulse rounded-xl bg-surface-raised" />
          </div>
        )}
        {state.status === "error" && (
          <div className="grid gap-3">
            <p role="alert" className="text-sm text-rose-300">
              {state.message}
            </p>
            <Button variant="secondary" size="sm" className="justify-self-start" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
        {state.status === "skipped" && (
          <div className="grid gap-2">
            <p className="font-medium">No answers recorded</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              The session ended before you answered, so there is nothing to analyse and nothing was saved.
            </p>
          </div>
        )}
        {state.status === "saved" && state.report && <ReportView report={state.report} />}
      </div>
    </dialog>
  );
}

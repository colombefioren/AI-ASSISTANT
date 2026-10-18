"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Interviewer } from "@/lib/interviewers";
import { cn } from "@/lib/utils";
import type { AudioBridge } from "./avatar/types";

const AvatarCanvas = dynamic(() => import("./avatar/AvatarCanvas"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Avatar scene failed to render", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface AvatarStageProps {
  interviewer: Interviewer;
  audio: React.RefObject<AudioBridge>;
  /** Speech bubble text: the greeting before a session, live captions during one. */
  bubble?: string;
}

export function AvatarStage({ interviewer, audio, bubble }: AvatarStageProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const handleReady = useCallback(() => setReadyFor(interviewer.id), [interviewer.id]);
  const loading = readyFor !== interviewer.id;

  return (
    <div className="relative h-full min-h-[inherit] bg-gradient-to-b from-surface-raised/70 to-surface">
      <SceneBoundary
        fallback={
          <div className="grid h-full place-items-center px-6 text-center text-sm text-ink-muted">
            Your browser could not start the 3D view. The interview still works with audio only.
          </div>
        }
      >
        <div className={cn("absolute inset-0 transition-opacity duration-700 ease-out", loading ? "opacity-0" : "opacity-100")}>
          <AvatarCanvas interviewer={interviewer} audio={audio} reduceMotion={reduceMotion} onReady={handleReady} />
        </div>
      </SceneBoundary>

      {loading && (
        <div className="absolute inset-0 grid place-items-center" aria-live="polite">
          <div className="flex flex-col items-center gap-4">
            <div className="size-36 animate-pulse rounded-full bg-surface-raised" />
            <p className="text-sm text-ink-muted">Bringing {interviewer.displayName} in</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-5 sm:px-8 sm:pb-8">
        <AnimatePresence mode="wait">
          {bubble && !loading && (
            <motion.div
              key={bubble}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-xl rounded-2xl bg-slate-50 px-5 py-3.5 text-[15px] leading-relaxed text-slate-900"
              aria-live="polite"
            >
              <span aria-hidden className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-slate-50" />
              <span className="relative">{bubble}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

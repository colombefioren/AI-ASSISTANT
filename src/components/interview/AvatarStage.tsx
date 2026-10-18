"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
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
  /** Whether the interviewer may greet; false while a session is running. */
  greet: boolean;
}

const GREETING = "Hi there! Let's start your interview.";

export function AvatarStage({ interviewer, audio, greet }: AvatarStageProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const handleReady = useCallback(() => setReadyFor(interviewer.id), [interviewer.id]);
  const loading = readyFor !== interviewer.id;
  const bubbleAnchor = useRef<HTMLDivElement>(null);

  // Like the original, the interviewer says hi shortly after appearing and the
  // bubble then goes away. Switching interviewers greets again.
  const [greeting, setGreeting] = useState(false);
  useEffect(() => {
    setGreeting(false);
    if (loading || !greet) return;
    const show = setTimeout(() => setGreeting(true), 1200);
    const hide = setTimeout(() => setGreeting(false), 7500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [loading, greet, interviewer.id]);

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
          <AvatarCanvas
            interviewer={interviewer}
            audio={audio}
            reduceMotion={reduceMotion}
            onReady={handleReady}
            headAnchor={bubbleAnchor}
          />
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

      {/* Positioned every frame by the avatar so it stays beside the speaker's head.
          Always mounted so its size is known before it fades in. */}
      <div
        ref={bubbleAnchor}
        aria-hidden={!greeting}
        className="pointer-events-none absolute left-0 top-0 w-max max-w-[min(20rem,calc(100%-2rem))] opacity-0 data-[placed=true]:opacity-100"
      >
        <motion.div
          initial={false}
          animate={greeting ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom left" }}
          className="rounded-2xl rounded-bl-none bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900"
        >
          {GREETING}
        </motion.div>
      </div>
    </div>
  );
}

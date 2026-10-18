"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import type { Interviewer } from "@/lib/interviewers";
import { cn } from "@/lib/utils";
import type { AudioBridge, ConversationMode } from "./avatar/types";

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

const statusCopy: Record<ConversationMode | "connecting", string> = {
  idle: "Ready when you are",
  connecting: "Connecting",
  listening: "Listening",
  speaking: "Speaking",
};

interface AvatarStageProps {
  interviewer: Interviewer;
  audio: React.RefObject<AudioBridge>;
  status: ConversationMode | "connecting";
  caption?: string;
}

export function AvatarStage({ interviewer, audio, status, caption }: AvatarStageProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const handleReady = useCallback(() => setReadyFor(interviewer.id), [interviewer.id]);
  const loading = readyFor !== interviewer.id;
  const live = status === "listening" || status === "speaking";

  return (
    <div className="relative h-full min-h-[52dvh] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,rgb(var(--surface-raised))_0%,rgb(var(--canvas))_70%)]">
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
            <div className="size-40 animate-pulse rounded-full bg-surface-raised" />
            <p className="text-sm text-ink-muted">Bringing {interviewer.name} in</p>
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border bg-surface/80 px-3 py-1.5 text-xs font-medium backdrop-blur sm:left-6 sm:top-6">
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            live ? "bg-accent" : status === "connecting" ? "animate-pulse bg-ink-muted" : "bg-line",
            status === "speaking" && "animate-pulse"
          )}
        />
        <span>
          {interviewer.name}: {statusCopy[status]}
        </span>
      </div>

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-canvas via-canvas/70 to-transparent px-4 pb-6 pt-16 sm:px-10">
          <p className="max-w-2xl text-balance text-center text-base leading-relaxed text-ink sm:text-lg" aria-live="polite">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

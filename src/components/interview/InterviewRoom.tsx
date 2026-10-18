"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { signOut } from "next-auth/react";
import { Loader2, LogOut, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ENGLISH_ONLY_CONTEXT } from "@/lib/interview-script";
import { interviewerIds, interviewers, type InterviewerId } from "@/lib/interviewers";
import { cn } from "@/lib/utils";
import type { SessionReport } from "@/lib/report";
import type { SessionSummary } from "@/lib/sessions";
import { AvatarStage } from "./AvatarStage";
import { ReportView } from "./ReportView";
import { SessionHistory } from "./SessionHistory";
import { Transcript } from "./Transcript";
import type { AudioBridge } from "./avatar/types";
import type { TranscriptLine } from "./types";

type Phase = "ready" | "connecting" | "live" | "ended";

interface RoomProps {
  userName: string;
  initialHistory: SessionSummary[];
}

export function InterviewRoom(props: RoomProps) {
  return (
    <ConversationProvider>
      <Room {...props} />
    </ConversationProvider>
  );
}

type SaveState = {
  status: "idle" | "saving" | "saved" | "error" | "skipped";
  report?: SessionReport;
  message?: string;
};

function Room({ userName, initialHistory }: RoomProps) {
  const [interviewerId, setInterviewerId] = useState<InterviewerId>("coco");
  const [phase, setPhase] = useState<Phase>("ready");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [tab, setTab] = useState<"report" | "transcript">("report");
  const startedAt = useRef(0);
  const endedAt = useRef(0);
  const hasSpeech = useRef(false);
  const linesRef = useRef<TranscriptLine[]>([]);
  linesRef.current = lines;

  const interviewer = interviewers[interviewerId];

  const conversation = useConversation({
    onConnect: () => {
      startedAt.current = Date.now();
      setPhase("live");
      conversation.sendContextualUpdate(ENGLISH_ONLY_CONTEXT);
    },
    onDisconnect: (details) => {
      endedAt.current = Date.now();
      if (details.reason === "error") {
        setError(details.closeReason || details.message || "The interviewer ended the connection unexpectedly.");
      }
      // A session that dropped before anyone spoke has nothing to review.
      setPhase((current) => (current === "live" && hasSpeech.current ? "ended" : "ready"));
    },
    onError: (message) => {
      setError(message || "The connection to the interviewer dropped.");
    },
    onMessage: ({ message, role, response_id, event_id }) => {
      const text = message.trim();
      if (!text) return;
      hasSpeech.current = true;
      const id = response_id ?? `${role}-${event_id}`;
      setLines((current) => {
        const line: TranscriptLine = {
          id,
          speaker: role === "agent" ? "interviewer" : "candidate",
          text,
          at: Date.now() - startedAt.current,
        };
        const existing = current.findIndex((item) => item.id === id);
        if (existing === -1) return [...current, line];
        const next = current.slice();
        next[existing] = { ...line, at: current[existing].at };
        return next;
      });
    },
  });

  const { status, isSpeaking, isMuted, setMuted } = conversation;
  const connected = status === "connected";
  const mode = connected ? (isSpeaking ? "speaking" : "listening") : "idle";

  // The avatar polls these getters every frame instead of re-rendering React.
  const audio = useRef<AudioBridge>({
    mode: "idle",
    getOutputFrequency: () => null,
    getOutputVolume: () => 0,
    getInputVolume: () => 0,
  });
  const safely = <T,>(read: () => T, fallback: T) => {
    try {
      return read();
    } catch {
      return fallback;
    }
  };
  audio.current = {
    mode,
    getOutputFrequency: () => (connected ? safely(conversation.getOutputByteFrequencyData, null) : null),
    getOutputVolume: () => (connected ? safely(conversation.getOutputVolume, 0) : 0),
    getInputVolume: () => (connected ? safely(conversation.getInputVolume, 0) : 0),
  };

  const { endSession } = conversation;
  useEffect(() => () => endSession(), [endSession]);

  const start = useCallback(async () => {
    setError(null);
    setLines([]);
    hasSpeech.current = false;
    setSaveState({ status: "idle" });
    setTab("report");
    setPhase("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError("Microphone access is blocked. Allow it in your browser settings, then try again.");
      setPhase("ready");
      return;
    }

    try {
      const response = await fetch(`/api/conversation?interviewer=${interviewerId}`, { cache: "no-store" });
      const credentials = await response.json();
      if (!response.ok) throw new Error(credentials.error ?? "Could not reach the interviewer.");
      conversation.startSession({ ...credentials, connectionType: "websocket" });
      if (speakerMuted) conversation.setVolume({ volume: 0 });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reach the interviewer.");
      setPhase("ready");
    }
  }, [conversation, interviewerId, speakerMuted]);

  const saveSession = useCallback(async () => {
    if (!linesRef.current.some((line) => line.speaker === "candidate")) {
      setSaveState({ status: "skipped" });
      return;
    }
    setSaveState({ status: "saving" });
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewer: interviewerId,
          durationSec: Math.max(0, Math.round((endedAt.current - startedAt.current) / 1000)),
          transcript: linesRef.current.slice(-400),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this session.");
      setSaveState({ status: "saved", report: data.report });
      setHistory((current) => [
        {
          id: data.id,
          interviewer: interviewerId,
          createdAt: data.createdAt,
          durationSec: data.report.durationSec,
          answers: data.report.answers,
        },
        ...current,
      ]);
    } catch (cause) {
      setSaveState({ status: "error", message: cause instanceof Error ? cause.message : "Could not save this session." });
    }
  }, [interviewerId]);

  useEffect(() => {
    if (phase === "ended") void saveSession();
  }, [phase, saveSession]);

  const toggleSpeaker = () => {
    const next = !speakerMuted;
    setSpeakerMuted(next);
    if (connected) conversation.setVolume({ volume: next ? 0 : 1 });
  };

  const latestInterviewerLine = [...lines].reverse().find((line) => line.speaker === "interviewer");
  const stageStatus = phase === "connecting" ? "connecting" : mode;
  const busy = phase === "connecting" || connected;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-canvas/85 px-4 backdrop-blur sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-ink-muted sm:inline">{userName}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut aria-hidden />
            Sign out
          </Button>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section aria-label="Interviewer" className="relative min-h-[52dvh] lg:min-h-0">
          <div className="lg:absolute lg:inset-0">
            <AvatarStage
              interviewer={interviewer}
              audio={audio}
              status={stageStatus}
              caption={connected ? latestInterviewerLine?.text : undefined}
            />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-t bg-surface lg:h-[calc(100dvh-4rem)] lg:border-l lg:border-t-0">
          <div className="grid gap-5 border-b p-5 sm:p-6">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Interviewer</h1>
              <div role="radiogroup" aria-label="Choose interviewer" className="mt-3 grid grid-cols-2 gap-2">
                {interviewerIds.map((id) => {
                  const item = interviewers[id];
                  const selected = id === interviewerId;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={busy}
                      onClick={() => setInterviewerId(id)}
                      className={cn(
                        "rounded-panel border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        selected ? "border-accent bg-accent/10" : "hover:bg-surface-raised"
                      )}
                    >
                      <span className="block text-sm font-medium">{item.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{item.summary}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connected ? (
                <Button variant="danger" size="lg" className="flex-1" onClick={() => conversation.endSession()}>
                  <PhoneOff aria-hidden />
                  End interview
                </Button>
              ) : (
                <Button size="lg" className="flex-1" onClick={start} disabled={phase === "connecting"}>
                  {phase === "connecting" ? <Loader2 className="animate-spin" aria-hidden /> : <Mic aria-hidden />}
                  {phase === "connecting" ? "Connecting" : phase === "ended" ? "Start again" : "Start interview"}
                </Button>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="size-12"
                onClick={() => setMuted(!isMuted)}
                disabled={!connected}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                aria-pressed={isMuted}
              >
                {isMuted ? <MicOff aria-hidden /> : <Mic aria-hidden />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-12"
                onClick={toggleSpeaker}
                aria-label={speakerMuted ? "Unmute interviewer" : "Mute interviewer"}
                aria-pressed={speakerMuted}
              >
                {speakerMuted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
              </Button>
            </div>

            {error && (
              <p role="alert" className="rounded-field border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}
          </div>

          {phase === "ended" && (
            <div role="tablist" aria-label="Session results" className="mx-5 mt-5 grid grid-cols-2 rounded-full border bg-canvas p-1 sm:mx-6">
              {(["report", "transcript"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                  className={cn(
                    "h-8 rounded-full text-sm font-medium capitalize transition-colors",
                    tab === item ? "bg-surface-raised text-ink" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <div className="min-h-[240px] flex-1 overflow-y-auto px-5 sm:px-6">
            {phase === "ended" && tab === "report" ? (
              <div className="py-6">
                {saveState.status === "saving" && (
                  <div className="grid gap-4" aria-live="polite" aria-busy>
                    <p className="text-sm text-ink-muted">Analysing your answers</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((key) => (
                        <div key={key} className="h-12 animate-pulse rounded-field bg-surface-raised" />
                      ))}
                    </div>
                    <div className="h-24 animate-pulse rounded-field bg-surface-raised" />
                  </div>
                )}
                {saveState.status === "error" && (
                  <div className="grid gap-3">
                    <p role="alert" className="text-sm text-danger">
                      {saveState.message}
                    </p>
                    <Button variant="secondary" size="sm" className="justify-self-start" onClick={() => void saveSession()}>
                      Try again
                    </Button>
                  </div>
                )}
                {saveState.status === "skipped" && (
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">No answers recorded</p>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      The session ended before you answered, so there is nothing to analyse and nothing was saved.
                    </p>
                  </div>
                )}
                {saveState.status === "saved" && saveState.report && <ReportView report={saveState.report} compact />}
              </div>
            ) : (
              <>
                <Transcript lines={lines} interviewerName={interviewer.name} follow={connected} />
                {!busy && phase !== "ended" && <SessionHistory sessions={history} />}
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

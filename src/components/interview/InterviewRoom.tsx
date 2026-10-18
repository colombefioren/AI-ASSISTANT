"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, LogOut, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { languageContext } from "@/lib/interview-script";
import { DEFAULT_LANGUAGE, isInterviewLanguage, type InterviewLanguage } from "@/lib/languages";
import { interviewers, type InterviewerId } from "@/lib/interviewers";
import { cn } from "@/lib/utils";
import type { SessionReport } from "@/lib/report";
import type { SessionSummary } from "@/lib/sessions";
import { AvatarStage } from "./AvatarStage";
import { FeedbackDialog } from "./FeedbackDialog";
import { InterviewerToggle } from "./InterviewerToggle";
import { LanguageToggle } from "./LanguageToggle";
import { SessionHistory } from "./SessionHistory";
import { Transcript } from "./Transcript";
import type { AudioBridge } from "./avatar/types";
import type { TranscriptLine } from "./types";

type Phase = "ready" | "connecting" | "live" | "ended";

const LANGUAGE_KEY = "aic.interview-language";

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

export type SaveState = {
  status: "idle" | "saving" | "saved" | "error" | "skipped";
  report?: SessionReport;
  message?: string;
};

function Room({ userName, initialHistory }: RoomProps) {
  const [interviewerId, setInterviewerId] = useState<InterviewerId>("coco");
  const [language, setLanguage] = useState<InterviewLanguage>(DEFAULT_LANGUAGE);
  const [phase, setPhase] = useState<Phase>("ready");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const startedAt = useRef(0);
  const endedAt = useRef(0);
  const hasSpeech = useRef(false);
  const linesRef = useRef<TranscriptLine[]>([]);
  // Interviewer of the session in progress, so switching after it ends
  // cannot relabel or re-save it.
  const sessionInterviewer = useRef<InterviewerId>(interviewerId);
  const sessionLanguage = useRef<InterviewLanguage>(language);
  const savedSession = useRef(false);
  linesRef.current = lines;

  const interviewer = interviewers[interviewerId];

  const conversation = useConversation({
    // Applied by the SDK once a session exists; calling setVolume before the
    // connection is created throws.
    volume: speakerMuted ? 0 : 1,
    onConnect: () => {
      startedAt.current = Date.now();
      setPhase("live");
      conversation.sendContextualUpdate(languageContext[sessionLanguage.current]);
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
    savedSession.current = false;
    sessionInterviewer.current = interviewerId;
    sessionLanguage.current = language;
    setSaveState({ status: "idle" });
    setFeedbackOpen(false);
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
      const query = new URLSearchParams({ interviewer: interviewerId, language });
      const response = await fetch(`/api/conversation?${query}`, { cache: "no-store" });
      const credentials = await response.json();
      if (!response.ok) throw new Error(credentials.error ?? "Could not reach the interviewer.");
      conversation.startSession({ ...credentials, connectionType: "websocket" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reach the interviewer.");
      setPhase("ready");
    }
  }, [conversation, interviewerId, language]);

  const saveSession = useCallback(async () => {
    const sessionId = sessionInterviewer.current;
    if (!linesRef.current.some((line) => line.speaker === "candidate")) {
      setSaveState({ status: "skipped" });
      setFeedbackOpen(true);
      return;
    }
    setSaveState({ status: "saving" });
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewer: sessionId,
          durationSec: Math.max(0, Math.round((endedAt.current - startedAt.current) / 1000)),
          transcript: linesRef.current.slice(-400),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this session.");
      setSaveState({ status: "saved", report: data.report });
      setFeedbackOpen(true);
      setHistory((current) => [
        {
          id: data.id,
          interviewer: sessionId,
          createdAt: data.createdAt,
          durationSec: data.report.durationSec,
          answers: data.report.answers,
        },
        ...current,
      ]);
    } catch (cause) {
      setSaveState({ status: "error", message: cause instanceof Error ? cause.message : "Could not save this session." });
    }
  }, []);

  useEffect(() => {
    if (phase !== "ended" || savedSession.current) return;
    savedSession.current = true;
    void saveSession();
  }, [phase, saveSession]);

  const toggleSpeaker = () => setSpeakerMuted((muted) => !muted);

  // The chosen language sticks until the candidate changes it.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (isInterviewLanguage(stored)) setLanguage(stored);
    } catch {
      // Storage can be unavailable (private mode); the default still works.
    }
  }, []);

  const chooseLanguage = (next: InterviewLanguage) => {
    setLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Ignore: the choice still applies to this visit.
    }
  };

  const busy = phase === "connecting" || connected;
  const statusText =
    phase === "connecting"
      ? "Connecting"
      : connected
        ? isSpeaking
          ? `${interviewer.displayName} is speaking`
          : "Listening to you"
        : phase === "ended"
          ? "Interview finished"
          : "Not started";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            className="grid size-10 place-items-center rounded-full border border-white/10 text-ink-muted transition-colors hover:border-white/20 hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <Logo className="hidden sm:inline-flex" />
        </div>
        <InterviewerToggle value={interviewerId} onChange={setInterviewerId} disabled={busy} />
        <div className="flex items-center gap-1">
          <span className="hidden pr-2 text-sm text-ink-muted md:inline">{userName}</span>
          <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out">
            <LogOut aria-hidden />
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 sm:gap-5 sm:p-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <aside className="order-2 flex min-h-0 flex-col rounded-2xl border border-white/[0.08] bg-surface lg:order-1 lg:h-[calc(100dvh-7rem)]">
          <div className="grid gap-5 border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-muted">Your interviewer</p>
                <h1 className="mt-1 bg-accent-gradient bg-clip-text text-[1.7rem] font-semibold leading-tight tracking-tight text-transparent">
                  {interviewer.displayName}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">{interviewer.summary}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
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
                  onClick={toggleSpeaker}
                  aria-label={speakerMuted ? "Unmute interviewer" : "Mute interviewer"}
                  aria-pressed={speakerMuted}
                >
                  {speakerMuted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
                </Button>
              </div>
            </div>

            <LanguageToggle value={language} onChange={chooseLanguage} disabled={busy} />

            <p className="flex items-center gap-2 text-sm" aria-live="polite">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  connected ? (isSpeaking ? "animate-pulse bg-accent" : "bg-emerald-400") : "bg-slate-600"
                )}
              />
              <span className={connected ? "text-ink" : "text-ink-muted"}>{statusText}</span>
            </p>

            <div className="grid gap-2.5">
              {connected ? (
                <Button variant="danger" size="lg" onClick={() => conversation.endSession()}>
                  <PhoneOff aria-hidden />
                  End interview
                </Button>
              ) : (
                <Button size="lg" onClick={start} disabled={phase === "connecting"}>
                  {phase === "connecting" ? <Loader2 className="animate-spin" aria-hidden /> : <Mic aria-hidden />}
                  {phase === "connecting" ? "Connecting" : phase === "ended" ? "Start a new interview" : "Start interview"}
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setFeedbackOpen(true)}
                disabled={phase !== "ended" || saveState.status === "idle"}
              >
                {saveState.status === "saving" ? <Loader2 className="animate-spin" aria-hidden /> : <FileText aria-hidden />}
                Show feedback
              </Button>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}
          </div>

          <div className="min-h-[220px] flex-1 overflow-y-auto px-5 sm:px-6">
            <Transcript lines={lines} interviewerName={interviewer.displayName} follow={connected} />
            {!busy && lines.length === 0 && <SessionHistory sessions={history} />}
          </div>
        </aside>

        <section
          aria-label={interviewer.displayName}
          className="relative order-1 min-h-[58dvh] overflow-hidden rounded-2xl border border-white/[0.08] bg-surface lg:order-2 lg:h-[calc(100dvh-7rem)] lg:min-h-0"
        >
          <AvatarStage interviewer={interviewer} audio={audio} greet={phase === "ready"} />
        </section>
      </main>

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        state={saveState}
        interviewerName={interviewers[sessionInterviewer.current].displayName}
        onRetry={() => void saveSession()}
      />
    </div>
  );
}

export type InterviewerId = "coco" | "mimi";

export interface Interviewer {
  id: InterviewerId;
  name: string;
  /** How the interviewer is addressed in the interface. */
  displayName: string;
  summary: string;
  avatarUrl: string;
  /** Per-model tuning so lip sync reads equally well on both rigs. */
  rig: {
    visemeGain: number;
    jawGain: number;
    /** Material name to flat color, used to hide printed logos on clothing. */
    recolor?: Record<string, string>;
  };
}

export const interviewers: Record<InterviewerId, Interviewer> = {
  coco: {
    id: "coco",
    name: "Coco",
    displayName: "Ms. Coco",
    summary: "Interviewer with a female voice.",
    avatarUrl: "/avatars/coco.glb",
    rig: { visemeGain: 0.9, jawGain: 0.35 },
  },
  mimi: {
    id: "mimi",
    name: "Mimi",
    displayName: "Mr. Mimi",
    summary: "Interviewer with a male voice.",
    avatarUrl: "/avatars/mimi.glb",
    rig: { visemeGain: 0.85, jawGain: 0.45, recolor: { outfit_top: "#34465a" } },
  },
};

export const interviewerIds = Object.keys(interviewers) as InterviewerId[];

export function isInterviewerId(value: unknown): value is InterviewerId {
  return typeof value === "string" && value in interviewers;
}

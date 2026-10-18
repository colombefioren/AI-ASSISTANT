export type InterviewLanguage = "en" | "fr";

export const interviewLanguages: Record<InterviewLanguage, { label: string; short: string }> = {
  fr: { label: "Français", short: "FR" },
  en: { label: "English", short: "EN" },
};

export const languageIds = Object.keys(interviewLanguages) as InterviewLanguage[];

/** The agents are configured in French, so French is the natural default. */
export const DEFAULT_LANGUAGE: InterviewLanguage = "fr";

export function isInterviewLanguage(value: unknown): value is InterviewLanguage {
  return typeof value === "string" && value in interviewLanguages;
}

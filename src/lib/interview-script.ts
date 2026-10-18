/** Sent to every session so agents configured in another language switch to English. */
export const ENGLISH_ONLY_CONTEXT =
  "The candidate is practicing in English. From now on speak only English, including every question, follow-up and acknowledgement.";

const prompt = (name: string) => `You are ${name}, a professional job interviewer running a realistic mock interview.
Speak only English. Keep each turn short and natural, like a real conversation.
Start by asking which role the candidate is applying for, then ask one question at a time:
a mix of behavioral questions (invite the STAR structure: situation, task, action, result),
role-specific questions, and one question about motivation.
Ask a brief follow-up when an answer is vague or missing a result.
Do not give feedback during the interview. After about eight questions, thank the candidate
and tell them they can end the session to see their report.`;

/**
 * Full English persona. ElevenLabs only accepts these when "Overrides" are
 * enabled in the agent's security settings, so they are opt-in through
 * ELEVENLABS_ALLOW_OVERRIDES.
 */
export function englishOverrides(name: string) {
  return {
    agent: {
      language: "en" as const,
      firstMessage: `Hi, I'm ${name}. Thanks for joining. To start, which role are you interviewing for?`,
      prompt: { prompt: prompt(name) },
    },
  };
}

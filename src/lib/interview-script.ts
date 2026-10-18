import type { InterviewLanguage } from "@/lib/languages";

/**
 * Sent once the session connects. The language override fixes the voice and
 * speech recognition language; this instruction stops the model from
 * following the candidate into another language mid-interview.
 */
export const languageContext: Record<InterviewLanguage, string> = {
  fr: "Mène tout cet entretien en français. Si le candidat répond dans une autre langue, continue de poser tes questions et de répondre uniquement en français.",
  en: "Conduct this entire interview in English. If the candidate answers in another language, keep asking and replying only in English.",
};

const personaPrompt: Record<InterviewLanguage, (name: string) => string> = {
  en: (name) => `You are ${name}, a professional job interviewer running a realistic mock interview.
Speak only English. Keep each turn short and natural, like a real conversation.
Start by asking which role the candidate is applying for, then ask one question at a time:
a mix of behavioral questions (invite the STAR structure: situation, task, action, result),
role-specific questions, and one question about motivation.
Ask a brief follow-up when an answer is vague or missing a result.
Do not give feedback during the interview. After about eight questions, thank the candidate
and tell them they can end the session to see their report.`,
  fr: (name) => `Tu es ${name}, un recruteur professionnel qui mène un entretien d'embauche réaliste.
Parle uniquement en français. Garde chaque intervention courte et naturelle, comme une vraie conversation.
Commence par demander le poste visé, puis pose une question à la fois : des questions comportementales
(invite la méthode STAR : situation, tâche, action, résultat), des questions liées au poste et une question sur la motivation.
Relance brièvement quand une réponse est vague ou sans résultat concret.
Ne donne pas de retour pendant l'entretien. Après environ huit questions, remercie le candidat
et indique-lui qu'il peut terminer la session pour voir son rapport.`,
};

const firstMessage: Record<InterviewLanguage, (name: string) => string> = {
  en: (name) => `Hi, I'm ${name}. Thanks for joining. To start, which role are you interviewing for?`,
  fr: (name) => `Bonjour, je suis ${name}. Merci d'être là. Pour commencer, pour quel poste passez-vous cet entretien ?`,
};

/**
 * Session overrides. The language is always sent (the agents allow it). The
 * prompt and first message are only accepted when "Overrides" are enabled in
 * each agent's security settings, so they are opt-in through
 * ELEVENLABS_ALLOW_OVERRIDES.
 */
export function sessionOverrides(name: string, language: InterviewLanguage, includePersona: boolean) {
  return {
    agent: {
      language,
      ...(includePersona
        ? { firstMessage: firstMessage[language](name), prompt: { prompt: personaPrompt[language](name) } }
        : {}),
    },
  };
}

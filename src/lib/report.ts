import { z } from "zod";
import type { InterviewLanguage } from "@/lib/languages";

export const transcriptLineSchema = z.object({
  id: z.string().max(120),
  speaker: z.enum(["interviewer", "candidate"]),
  text: z.string().trim().min(1).max(4000),
  at: z.number().int().min(0).max(4 * 60 * 60 * 1000),
});

export type TranscriptLine = z.infer<typeof transcriptLineSchema>;

export interface SessionReport {
  version: 1;
  /** Language the answers were analysed in; reports saved before this field were English. */
  language?: InterviewLanguage;
  durationSec: number;
  answers: number;
  candidateWords: number;
  avgAnswerWords: number;
  /** Candidate share of all words spoken, 0-1. */
  talkShare: number;
  fillersPer100: number;
  topFillers: { phrase: string; count: number }[];
  /** Share of substantive answers that mention a concrete outcome, 0-1. */
  outcomeRate: number;
  /** "I" statements as a share of "I" plus "we" statements, 0-1. */
  ownership: number;
  strengths: string[];
  improvements: string[];
}

interface Lexicon {
  fillers: string[];
  hedges: string[];
  /** Words and patterns that usually signal a result in a STAR-style answer. */
  outcome: RegExp;
  self: string[];
  team: string[];
  selfLabel: string;
  teamLabel: string;
  hedgeExamples: string;
}

const LEXICONS: Record<InterviewLanguage, Lexicon> = {
  en: {
    fillers: ["um", "uh", "erm", "like", "you know", "basically", "actually", "kind of", "sort of", "i mean", "literally"],
    hedges: ["i think", "i guess", "maybe", "probably", "i'm not sure", "i don't know", "kind of", "sort of"],
    outcome:
      /\d+(?:\.\d+)?\s?(?:%|(?:percent|x|k|users|customers|hours|days|weeks|months)\b)|\b(?:result(?:ed)?|increas\w*|reduc\w*|improv\w*|sav(?:ed|ing)|grew|grow\w*|cut|launch\w*|deliver\w*|led to|so that|outcome|impact)\b/i,
    self: ["i", "my"],
    team: ["we", "our"],
    selfLabel: '"I"',
    teamLabel: '"we"',
    hedgeExamples: '"I think", "maybe"',
  },
  fr: {
    fillers: ["euh", "heu", "bah", "ben", "genre", "du coup", "en fait", "voilà", "tu vois", "vous voyez", "disons", "bref"],
    hedges: ["je pense", "je crois", "peut-être", "je suppose", "je ne sais pas", "je sais pas", "plus ou moins", "un peu"],
    outcome:
      /\d+(?:[.,]\d+)?\s?(?:%|(?:pour\s?cent|utilisateurs|clients|heures|jours|semaines|mois)(?![\p{L}\p{N}]))|(?<![\p{L}\p{N}])(?:résultats?|augment\p{L}*|rédui\p{L}*|réduction|amélior\p{L}*|économis\p{L}*|lanc\p{L}*|livr\p{L}*|gagn\p{L}*|ce qui a permis|grâce à|impact)(?![\p{L}\p{N}])/iu,
    self: ["je", "j'", "moi", "mon", "ma", "mes"],
    team: ["nous", "on", "notre", "nos"],
    selfLabel: '"je"',
    teamLabel: '"nous" or "on"',
    hedgeExamples: '"je pense", "peut-être"',
  },
};

const SUBSTANTIVE_WORDS = 25;

const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}'’%]+/gu) ?? [];

function countPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Letter-aware boundaries so accented words and elisions like "j'" match.
  const tail = phrase.endsWith("'") ? "" : "(?![\\p{L}\\p{N}])";
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}${tail}`, "giu");
  return text.replace(/’/g, "'").match(pattern)?.length ?? 0;
}

// "like" is only a filler when it is not a verb or comparison ("I'd like", "looks like").
const VERB_LIKE = /\b(would|'d|i|we|you|they|feel|felt|look|looks|looked|sounds?|seems?|things?|just)\s+like\b/gi;

function countFiller(text: string, phrase: string) {
  const count = countPhrase(text, phrase);
  return phrase === "like" ? Math.max(0, count - (text.match(VERB_LIKE)?.length ?? 0)) : count;
}

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

export function buildReport(lines: TranscriptLine[], durationSec: number, language: InterviewLanguage = "en"): SessionReport {
  const lexicon = LEXICONS[language];
  const answers = lines.filter((line) => line.speaker === "candidate");
  const questions = lines.filter((line) => line.speaker === "interviewer");
  const answerText = answers.map((line) => line.text).join(" ");

  const candidateWords = words(answerText).length;
  const interviewerWords = words(questions.map((line) => line.text).join(" ")).length;
  const avgAnswerWords = answers.length ? candidateWords / answers.length : 0;
  const talkShare = candidateWords + interviewerWords ? candidateWords / (candidateWords + interviewerWords) : 0;

  const fillerCounts = lexicon.fillers.map((phrase) => ({ phrase, count: countFiller(answerText, phrase) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillerCounts.reduce((sum, item) => sum + item.count, 0);
  const fillersPer100 = candidateWords ? (fillerTotal / candidateWords) * 100 : 0;
  const hedges = lexicon.hedges.reduce((sum, phrase) => sum + countPhrase(answerText, phrase), 0);

  const substantive = answers.filter((line) => words(line.text).length >= SUBSTANTIVE_WORDS);
  const withOutcome = substantive.filter((line) => lexicon.outcome.test(line.text));
  const outcomeRate = substantive.length ? withOutcome.length / substantive.length : 0;

  const iCount = lexicon.self.reduce((sum, word) => sum + countPhrase(answerText, word), 0);
  const weCount = lexicon.team.reduce((sum, word) => sum + countPhrase(answerText, word), 0);
  const ownership = iCount + weCount ? iCount / (iCount + weCount) : 0;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (answers.length === 0) {
    improvements.push("No answers were captured. Check that your microphone works and speak after the interviewer finishes.");
  } else {
    if (avgAnswerWords >= 45 && avgAnswerWords <= 180) {
      strengths.push(`Your answers averaged ${Math.round(avgAnswerWords)} words, a good length for spoken answers.`);
    } else if (avgAnswerWords < 45) {
      improvements.push(
        `Your answers averaged ${Math.round(avgAnswerWords)} words. Add context and a concrete example so each answer can stand on its own.`
      );
    } else {
      improvements.push(
        `Your answers averaged ${Math.round(avgAnswerWords)} words. Lead with the main point and aim for one to two minutes per answer.`
      );
    }

    if (fillersPer100 <= 2) {
      strengths.push("You used very few filler words, which makes you sound prepared.");
    } else {
      const top = fillerCounts.slice(0, 2).map((item) => `"${item.phrase}" (${item.count})`).join(" and ");
      improvements.push(
        `About ${round(fillersPer100)} filler words per 100, mostly ${top}. A short pause reads as more confident than a filler.`
      );
    }

    if (substantive.length > 0) {
      if (outcomeRate >= 0.6) {
        strengths.push("Most of your longer answers ended with a concrete result, the part interviewers remember.");
      } else {
        improvements.push(
          `Only ${withOutcome.length} of ${substantive.length} longer answers mentioned an outcome. Close stories with the result, ideally a number.`
        );
      }
    }

    if (iCount + weCount >= 6) {
      if (ownership >= 0.55) {
        strengths.push("You described your own actions clearly instead of hiding behind the team.");
      } else {
        improvements.push(
          `You said ${lexicon.teamLabel} more than ${lexicon.selfLabel}. Interviewers want to know what you did, so name your own decisions.`
        );
      }
    }

    if (hedges >= 4) {
      improvements.push(`You hedged ${hedges} times (${lexicon.hedgeExamples}). State what you know plainly.`);
    }

    if (talkShare >= 0.55) {
      strengths.push("You carried most of the conversation, which is what a strong candidate does.");
    }
  }

  return {
    version: 1,
    language,
    durationSec,
    answers: answers.length,
    candidateWords,
    avgAnswerWords: Math.round(avgAnswerWords),
    talkShare: round(talkShare, 2),
    fillersPer100: round(fillersPer100),
    topFillers: fillerCounts.slice(0, 3),
    outcomeRate: round(outcomeRate, 2),
    ownership: round(ownership, 2),
    strengths,
    improvements,
  };
}

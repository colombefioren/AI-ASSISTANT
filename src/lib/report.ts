import { z } from "zod";

export const transcriptLineSchema = z.object({
  id: z.string().max(120),
  speaker: z.enum(["interviewer", "candidate"]),
  text: z.string().trim().min(1).max(4000),
  at: z.number().int().min(0).max(4 * 60 * 60 * 1000),
});

export type TranscriptLine = z.infer<typeof transcriptLineSchema>;

export interface SessionReport {
  version: 1;
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

const FILLERS = ["um", "uh", "erm", "like", "you know", "basically", "actually", "kind of", "sort of", "i mean", "literally"];
const HEDGES = ["i think", "i guess", "maybe", "probably", "i'm not sure", "i don't know", "kind of", "sort of"];
// Words and patterns that usually signal a result in a STAR-style answer.
const OUTCOME = /\b(\d+(\.\d+)?\s?(%|percent|x|k|users|customers|hours|days|weeks|months)|result(ed)?|increas\w*|reduc\w*|improv\w*|sav(ed|ing)|grew|grow\w*|cut|launch\w*|deliver\w*|led to|so that|outcome|impact)\b/i;
const SUBSTANTIVE_WORDS = 25;

const words = (text: string) => text.toLowerCase().match(/[a-z0-9'%]+/g) ?? [];

function countPhrase(text: string, phrase: string) {
  const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  return text.match(pattern)?.length ?? 0;
}

// "like" is only a filler when it is not a verb or comparison ("I'd like", "looks like").
const VERB_LIKE = /\b(would|'d|i|we|you|they|feel|felt|look|looks|looked|sounds?|seems?|things?|just)\s+like\b/gi;

function countFiller(text: string, phrase: string) {
  const count = countPhrase(text, phrase);
  return phrase === "like" ? Math.max(0, count - (text.match(VERB_LIKE)?.length ?? 0)) : count;
}

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

export function buildReport(lines: TranscriptLine[], durationSec: number): SessionReport {
  const answers = lines.filter((line) => line.speaker === "candidate");
  const questions = lines.filter((line) => line.speaker === "interviewer");
  const answerText = answers.map((line) => line.text).join(" ");

  const candidateWords = words(answerText).length;
  const interviewerWords = words(questions.map((line) => line.text).join(" ")).length;
  const avgAnswerWords = answers.length ? candidateWords / answers.length : 0;
  const talkShare = candidateWords + interviewerWords ? candidateWords / (candidateWords + interviewerWords) : 0;

  const fillerCounts = FILLERS.map((phrase) => ({ phrase, count: countFiller(answerText, phrase) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillerCounts.reduce((sum, item) => sum + item.count, 0);
  const fillersPer100 = candidateWords ? (fillerTotal / candidateWords) * 100 : 0;
  const hedges = HEDGES.reduce((sum, phrase) => sum + countPhrase(answerText, phrase), 0);

  const substantive = answers.filter((line) => words(line.text).length >= SUBSTANTIVE_WORDS);
  const withOutcome = substantive.filter((line) => OUTCOME.test(line.text));
  const outcomeRate = substantive.length ? withOutcome.length / substantive.length : 0;

  const iCount = countPhrase(answerText, "i") + countPhrase(answerText, "my");
  const weCount = countPhrase(answerText, "we") + countPhrase(answerText, "our");
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
        improvements.push('You said "we" more than "I". Interviewers want to know what you did, so name your own decisions.');
      }
    }

    if (hedges >= 4) {
      improvements.push(`You hedged ${hedges} times ("I think", "maybe"). State what you know plainly.`);
    }

    if (talkShare >= 0.55) {
      strengths.push("You carried most of the conversation, which is what a strong candidate does.");
    }
  }

  return {
    version: 1,
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

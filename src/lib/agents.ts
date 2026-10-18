import "server-only";
import type { InterviewerId } from "@/lib/interviewers";

// Public ElevenLabs agents used by default. Override them per deployment.
const agentIds: Record<InterviewerId, string> = {
  coco: process.env.ELEVENLABS_AGENT_ID_COCO || "dqte1WRSWX3A2bDNwJt5",
  mimi: process.env.ELEVENLABS_AGENT_ID_MIMI || "zEMF3122dPrA9bMvf0Wl",
};

export type ConversationCredentials = { signedUrl: string } | { agentId: string };

/**
 * Returns a short-lived signed URL when an API key is configured (required for
 * private agents), otherwise the public agent id.
 */
export async function getConversationCredentials(interviewer: InterviewerId): Promise<ConversationCredentials> {
  const agentId = agentIds[interviewer];
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { agentId };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey }, cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs signed URL request failed with ${response.status}`);
  }
  const data = (await response.json()) as { signed_url: string };
  return { signedUrl: data.signed_url };
}

export type ConversationMode = "idle" | "listening" | "speaking";

/**
 * Live audio signals the avatar reads every frame. Kept in a ref so the 3D
 * scene never re-renders React when audio levels change.
 */
export interface AudioBridge {
  mode: ConversationMode;
  getOutputFrequency(): Uint8Array | null;
  getOutputVolume(): number;
  getInputVolume(): number;
}

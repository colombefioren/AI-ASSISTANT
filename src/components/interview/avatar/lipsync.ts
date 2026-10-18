/**
 * Turns the interviewer's live audio into viseme weights.
 *
 * The ElevenLabs SDK exposes byte frequency data resampled linearly across
 * 100-8000 Hz. Vowels are told apart by their first two formants (F1 tracks
 * how open the jaw is, F2 how far forward the tongue sits) and sibilants show
 * up as high-frequency energy, so a handful of band ratios is enough to pick
 * plausible mouth shapes in real time without any phoneme recognition.
 */

export const VISEMES = ["aa", "E", "I", "O", "U", "SS", "FF", "PP"] as const;
export type Viseme = (typeof VISEMES)[number];
export type VisemeWeights = Record<Viseme, number>;

const MIN_HZ = 100;
const MAX_HZ = 8000;

export function emptyWeights(): VisemeWeights {
  return { aa: 0, E: 0, I: 0, O: 0, U: 0, SS: 0, FF: 0, PP: 0 };
}

function band(data: Uint8Array, fromHz: number, toHz: number) {
  const n = data.length;
  const start = Math.max(0, Math.floor(((fromHz - MIN_HZ) / (MAX_HZ - MIN_HZ)) * n));
  const end = Math.min(n, Math.ceil(((toHz - MIN_HZ) / (MAX_HZ - MIN_HZ)) * n));
  if (end <= start) return 0;
  let sum = 0;
  for (let i = start; i < end; i++) sum += data[i];
  return sum / ((end - start) * 255);
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface SpectralFeatures {
  /** Overall loudness in the voice range, 0-1. */
  energy: number;
  /** 0 = closed vowels (i, u), 1 = open vowels (a). */
  openness: number;
  /** 0 = back vowels (o, u), 1 = front vowels (e, i). */
  frontness: number;
  /** Share of energy in the fricative band (s, sh, f). */
  sibilance: number;
}

export function analyse(data: Uint8Array): SpectralFeatures {
  const f1 = band(data, 250, 900);
  const f2low = band(data, 900, 1500);
  const f2high = band(data, 1500, 2700);
  const fric = band(data, 3800, 8000);
  const energy = band(data, 100, 4000);
  const eps = 1e-4;

  return {
    energy,
    openness: clamp01((f1 / (f1 + f2low + f2high + eps)) * 1.7 - 0.15),
    frontness: clamp01(f2high / (f2low + f2high + eps)),
    sibilance: clamp01((fric / (f1 + fric + eps)) * 2.2 - 0.25),
  };
}

/**
 * Scores each viseme from spectral features, sharpens the distribution so one
 * shape dominates (real mouths rarely blend five vowels at once) and scales the
 * result by loudness.
 */
export function visemesFromFeatures(f: SpectralFeatures, loudness: number): VisemeWeights {
  const w = emptyWeights();
  if (loudness < 0.02) return w;

  const open = f.openness;
  const front = f.frontness;
  const scores: VisemeWeights = {
    aa: open * (1 - Math.abs(front - 0.5)),
    E: (1 - open * 0.5) * front * 0.9,
    I: (1 - open) * front * 0.7,
    O: open * (1 - front) * 0.85,
    U: (1 - open) * (1 - front) * 0.6,
    SS: Math.pow(f.sibilance, 1.4) * 1.3,
    FF: f.sibilance * (1 - open) * 0.35,
    // Lips press together at the quiet edges of syllables.
    PP: loudness < 0.08 ? (0.08 - loudness) * 6 : 0,
  };

  let total = 0;
  for (const v of VISEMES) {
    scores[v] = Math.pow(scores[v], 1.6);
    total += scores[v];
  }
  if (total <= 0) return w;

  const intensity = clamp01(loudness * 1.15);
  for (const v of VISEMES) w[v] = (scores[v] / total) * intensity;
  return w;
}

/**
 * Turns raw voice energy into a per-syllable mouth opening.
 *
 * The SDK's analyser smooths its spectrum over time, so absolute energy barely
 * dips between syllables and a fixed threshold leaves the mouth hanging open.
 * Tracking the recent minimum and maximum and normalising between them makes
 * every dip read as a closure and every stressed syllable as a full opening.
 */
export class SyllableEnvelope {
  private low = 0;
  private high = 0.1;

  step(energy: number, dt: number): number {
    // Fast to follow new extremes, slow to forget them (about half a second).
    this.low = energy < this.low ? energy : this.low + (energy - this.low) * Math.min(1, dt * 2.5);
    this.high = energy > this.high ? energy : this.high - (this.high - energy) * Math.min(1, dt * 1.2);
    if (energy < 0.025) return 0;

    const range = Math.max(this.high - this.low, 0.04);
    const relative = clamp01((energy - this.low) / range);
    // Ease in so small wobbles stay closed and real syllables open clearly.
    const shaped = relative * relative * (3 - 2 * relative);
    const presence = clamp01(energy * 8);
    return shaped * presence;
  }

  reset() {
    this.low = 0;
    this.high = 0.1;
  }
}

/**
 * Fallback used when no frequency data is available (for example when the
 * transport does not expose an analyser). Generates syllable-like mouth
 * movement at a natural speaking rate with short pauses between phrases.
 */
export class SyllableSynth {
  private time = 0;
  private syllableEnd = 0;
  private syllableStart = 0;
  private vowel: Viseme = "aa";
  private amplitude = 0.8;
  private nextPause = 2 + Math.random() * 2;

  step(dt: number): { weights: VisemeWeights; loudness: number } {
    this.time += dt;
    const weights = emptyWeights();

    if (this.time >= this.syllableEnd) {
      const pause = this.time >= this.nextPause;
      const duration = pause ? 0.18 + Math.random() * 0.25 : 0.14 + Math.random() * 0.12;
      this.syllableStart = this.time;
      this.syllableEnd = this.time + duration;
      if (pause) {
        this.amplitude = 0;
        this.nextPause = this.time + 1.6 + Math.random() * 2.4;
      } else {
        const pool: Viseme[] = ["aa", "aa", "E", "E", "I", "O", "U", "SS", "PP"];
        this.vowel = pool[Math.floor(Math.random() * pool.length)];
        this.amplitude = 0.55 + Math.random() * 0.45;
      }
    }

    const phase = (this.time - this.syllableStart) / (this.syllableEnd - this.syllableStart);
    const loudness = this.amplitude * Math.sin(Math.PI * clamp01(phase)) ** 2 * 0.45;
    weights[this.vowel] = clamp01(loudness * 2.2);
    return { weights, loudness };
  }
}

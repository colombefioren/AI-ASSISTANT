import { describe, expect, it } from "vitest";
import { SyllableEnvelope, SyllableSynth, VISEMES, analyse, visemesFromFeatures } from "./lipsync";

/** Builds a 100-8000 Hz spectrum with energy in the given frequency bands. */
function spectrum(bands: [fromHz: number, toHz: number, level: number][], size = 256) {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const hz = 100 + (i / size) * 7900;
    for (const [from, to, level] of bands) if (hz >= from && hz < to) data[i] = level;
  }
  return data;
}

const dominant = (weights: Record<string, number>) =>
  Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];

describe("lip sync heuristics", () => {
  it("keeps the mouth closed in silence", () => {
    const weights = visemesFromFeatures(analyse(new Uint8Array(256)), 0);
    expect(VISEMES.every((v) => weights[v] === 0)).toBe(true);
  });

  it("opens to an aa shape when energy sits in the first formant", () => {
    const features = analyse(spectrum([[250, 900, 230], [900, 1500, 120], [1500, 2700, 110]]));
    expect(features.openness).toBeGreaterThan(0.5);
    expect(dominant(visemesFromFeatures(features, 0.6))).toBe("aa");
  });

  it("picks a front vowel when the upper second formant dominates", () => {
    const features = analyse(spectrum([[250, 900, 40], [900, 1500, 30], [1500, 2700, 220]]));
    expect(["E", "I"]).toContain(dominant(visemesFromFeatures(features, 0.6)));
  });

  it("recognises sibilants from high-frequency energy", () => {
    const features = analyse(spectrum([[250, 900, 20], [3800, 8000, 200]]));
    expect(dominant(visemesFromFeatures(features, 0.4))).toBe("SS");
  });

  it("never lets total viseme weight exceed full intensity", () => {
    const features = analyse(spectrum([[100, 8000, 255]]));
    const weights = visemesFromFeatures(features, 1);
    const total = VISEMES.reduce((sum, v) => sum + weights[v], 0);
    expect(total).toBeLessThanOrEqual(1.0001);
  });

  it("synthesises bounded syllables when no spectrum is available", () => {
    const synth = new SyllableSynth();
    for (let i = 0; i < 600; i++) {
      const { weights, loudness } = synth.step(1 / 60);
      expect(loudness).toBeGreaterThanOrEqual(0);
      expect(loudness).toBeLessThanOrEqual(0.5);
      for (const v of VISEMES) expect(weights[v]).toBeLessThanOrEqual(1);
    }
  });

  it("closes the mouth on dips between syllables even when energy never reaches zero", () => {
    const envelope = new SyllableEnvelope();
    const dt = 1 / 60;
    const openings: number[] = [];
    // Smoothed speech energy: 4.5 syllables per second between 0.18 and 0.3.
    for (let frame = 0; frame < 180; frame++) {
      const t = frame * dt;
      const energy = 0.24 + 0.06 * Math.sin(2 * Math.PI * 4.5 * t);
      openings.push(envelope.step(energy, dt));
    }
    const settled = openings.slice(60);
    expect(Math.min(...settled)).toBeLessThan(0.15);
    expect(Math.max(...settled)).toBeGreaterThan(0.75);
  });

  it("stays closed in silence", () => {
    const envelope = new SyllableEnvelope();
    for (let i = 0; i < 60; i++) expect(envelope.step(0.01, 1 / 60)).toBe(0);
  });
});

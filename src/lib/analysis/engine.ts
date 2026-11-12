/**
 * ÉLORIA vision engine — pure functions (no I/O) so they can be unit tested.
 *
 * `extractFeatures` turns raw RGB pixels into photometric features.
 * `skinMetricsFromFeatures` / `scalpMetricsFromFeatures` map those features to
 * 0–100 metric levels. Score helpers convert levels into health scores.
 *
 * Metric semantics (levels, not scores):
 *   skin:  hydration ↑good, oiliness ideal≈40, pores ↓good, wrinkles ↓good,
 *          redness ↓good, pigmentation ↓good, elasticity ↑good
 *   scalp: hydration ↑good, oiliness ideal≈35, flaking ↓good, sensitivity ↓good,
 *          density ↑good, follicle_health ↑good
 */
import type { ScalpMetrics, SkinMetrics } from "@/lib/types";

export interface ImageFeatures {
  /** mean luminance 0..1 */
  brightness: number;
  /** std-dev of luminance 0..1 */
  contrast: number;
  /** mean |laplacian| of luminance (high-frequency texture) 0..1 */
  texture: number;
  /** mean red dominance among skin pixels 0..1 */
  redness: number;
  /** share of bright, low-saturation pixels (specular shine / white flakes) 0..1 */
  highlights: number;
  /** share of pixels significantly darker than their neighbourhood 0..1 */
  darkSpots: number;
  /** mean saturation 0..1 */
  saturation: number;
  /** share of pixels classified as skin (YCbCr) 0..1 */
  skinRatio: number;
  /** share of very dark pixels (hair strands on scalp images) 0..1 */
  darkRatio: number;
}

const r1 = (n: number) => Math.round(n * 1000) / 1000;
const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const lvl = (n: number) => Math.round(clamp(n));

export function extractFeatures(data: Uint8Array | Buffer, width: number, height: number, channels = 3): ImageFeatures {
  const n = width * height;
  if (n === 0 || data.length < n * channels) throw new Error("Invalid image buffer");
  const lum = new Float32Array(n);
  let sumL = 0,
    sumSat = 0,
    skin = 0,
    redSum = 0,
    highlights = 0,
    dark = 0;

  for (let i = 0; i < n; i++) {
    const o = i * channels;
    const r = data[o] / 255,
      g = data[o + 1] / 255,
      b = data[o + 2] / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = l;
    sumL += l;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    sumSat += sat;

    // YCbCr skin classification (Chai & Ngan ranges)
    const R = data[o],
      G = data[o + 1],
      B = data[o + 2];
    const cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B;
    const cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B;
    if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
      skin++;
      redSum += Math.max(0, r - (g + b) / 2);
    }
    if (l > 0.82 && sat < 0.18) highlights++;
    if (l < 0.12) dark++;
  }

  const meanL = sumL / n;
  let varL = 0;
  for (let i = 0; i < n; i++) varL += (lum[i] - meanL) ** 2;
  const stdL = Math.sqrt(varL / n);

  // Laplacian texture + local dark spots (3x3 neighbourhood)
  let lap = 0,
    spots = 0,
    count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const nb = (lum[i - 1] + lum[i + 1] + lum[i - width] + lum[i + width]) / 4;
      lap += Math.abs(lum[i] - nb);
      if (nb - lum[i] > 0.06) spots++;
      count++;
    }
  }

  return {
    brightness: r1(meanL),
    contrast: r1(stdL),
    texture: r1(count ? lap / count : 0),
    redness: r1(skin ? redSum / skin : 0),
    highlights: r1(highlights / n),
    darkSpots: r1(count ? spots / count : 0),
    saturation: r1(sumSat / n),
    skinRatio: r1(skin / n),
    darkRatio: r1(dark / n),
  };
}

export type QualityIssue = "too_dark" | "overexposed" | "no_skin_detected" | "low_detail";

export function checkQuality(f: ImageFeatures, kind: "skin" | "scalp"): QualityIssue | null {
  if (f.brightness < 0.08) return "too_dark";
  if (f.brightness > 0.95) return "overexposed";
  if (f.contrast < 0.015 && f.texture < 0.002) return "low_detail";
  if (kind === "skin" && f.skinRatio < 0.08) return "no_skin_detected";
  return null;
}

export const QUALITY_MESSAGES: Record<QualityIssue, string> = {
  too_dark: "The image is too dark. Turn on the mirror halo light or move to a brighter space.",
  overexposed: "The image is overexposed. Step slightly away from the light source.",
  no_skin_detected: "We couldn't detect your face. Center your face in the frame and remove obstructions.",
  low_detail: "The image lacks detail. Hold still and make sure the lens is clean.",
};

export function skinMetricsFromFeatures(f: ImageFeatures): SkinMetrics {
  const texture = Math.min(f.texture / 0.06, 1); // 0..1
  const shine = Math.min(f.highlights / 0.12, 1);
  const red = Math.min(f.redness / 0.22, 1);
  const spots = Math.min(f.darkSpots / 0.08, 1);
  const contrast = Math.min(f.contrast / 0.3, 1);

  const oiliness = lvl(18 + shine * 70 + (f.saturation > 0.45 ? 6 : 0));
  const hydration = lvl(82 - texture * 35 - (1 - shine) * 10 + (f.brightness - 0.5) * 20);
  const pores = lvl(15 + texture * 55 + shine * 15);
  const wrinkles = lvl(10 + texture * 45 + contrast * 20);
  const redness = lvl(8 + red * 85);
  const pigmentation = lvl(10 + spots * 60 + contrast * 18);
  const elasticity = lvl(88 - wrinkles * 0.45 - (100 - hydration) * 0.2);

  return { hydration, oiliness, pores, wrinkles, redness, pigmentation, elasticity };
}

export function scalpMetricsFromFeatures(f: ImageFeatures): ScalpMetrics {
  const flakes = Math.min(f.highlights / 0.1, 1);
  const red = Math.min(f.redness / 0.2, 1);
  const hair = Math.min(f.darkRatio / 0.35, 1);
  const texture = Math.min(f.texture / 0.08, 1);
  const shine = Math.min(Math.max(f.saturation - 0.15, 0) / 0.4, 1);

  const flaking = lvl(6 + flakes * 80);
  const oiliness = lvl(15 + shine * 55 + (1 - flakes) * 10);
  const hydration = lvl(78 - flakes * 35 - texture * 12 + shine * 8);
  const sensitivity = lvl(8 + red * 80);
  const density = lvl(35 + hair * 55 + texture * 8);
  const follicle_health = lvl(90 - flaking * 0.3 - sensitivity * 0.3 - Math.abs(oiliness - 35) * 0.3);

  return { hydration, oiliness, flaking, sensitivity, density, follicle_health };
}

/** Converts a skin metric level into a 0–100 health score (higher is better). */
export function skinHealth(m: SkinMetrics): SkinMetrics {
  return {
    hydration: m.hydration,
    oiliness: lvl(100 - Math.abs(m.oiliness - 40) * 1.6),
    pores: 100 - m.pores,
    wrinkles: 100 - m.wrinkles,
    redness: 100 - m.redness,
    pigmentation: 100 - m.pigmentation,
    elasticity: m.elasticity,
  };
}

export function scalpHealth(m: ScalpMetrics): ScalpMetrics {
  return {
    hydration: m.hydration,
    oiliness: lvl(100 - Math.abs(m.oiliness - 35) * 1.6),
    flaking: 100 - m.flaking,
    sensitivity: 100 - m.sensitivity,
    density: m.density,
    follicle_health: m.follicle_health,
  };
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function skinOverallScore(m: SkinMetrics) {
  return lvl(avg(Object.values(skinHealth(m))));
}

export function scalpOverallScore(m: ScalpMetrics) {
  return lvl(avg(Object.values(scalpHealth(m))));
}

export function classifySkinType(m: SkinMetrics): string {
  if (m.redness >= 60) return "sensitive";
  if (m.oiliness >= 62 && m.hydration < 45) return "combination";
  if (m.oiliness >= 62) return "oily";
  if (m.hydration < 45) return "dry";
  return "normal";
}

export function classifyScalpType(m: ScalpMetrics): string {
  if (m.sensitivity >= 60) return "sensitive";
  if (m.flaking >= 55) return "flaky";
  if (m.oiliness >= 60) return "oily";
  if (m.hydration < 45) return "dry";
  return "balanced";
}

export const SKIN_LABELS: Record<keyof SkinMetrics, string> = {
  hydration: "Hydration",
  oiliness: "Oil balance",
  pores: "Pores",
  wrinkles: "Fine lines",
  redness: "Redness",
  pigmentation: "Even tone",
  elasticity: "Elasticity",
};

export const SCALP_LABELS: Record<keyof ScalpMetrics, string> = {
  hydration: "Hydration",
  oiliness: "Oil balance",
  flaking: "Flaking",
  sensitivity: "Sensitivity",
  density: "Density",
  follicle_health: "Follicle vitality",
};

export function describeSkin(m: SkinMetrics, type: string): { summary: string; observations: string[] } {
  const obs: string[] = [];
  if (m.hydration < 50) obs.push("Your skin shows signs of dehydration, especially across the cheeks.");
  else obs.push("Hydration levels look healthy and well balanced.");
  if (m.oiliness > 60) obs.push("Visible shine suggests elevated sebum in the T-zone.");
  if (m.pores > 55) obs.push("Pores appear enlarged around the nose and inner cheeks.");
  if (m.wrinkles > 45) obs.push("Fine lines are noticeable around the eyes and forehead.");
  if (m.redness > 45) obs.push("Areas of redness indicate possible irritation or sensitivity.");
  if (m.pigmentation > 50) obs.push("Uneven tone and dark spots are visible.");
  if (m.elasticity > 70) obs.push("Skin firmness and elasticity are excellent.");
  const score = skinOverallScore(m);
  const quality = score >= 80 ? "radiant" : score >= 65 ? "healthy" : score >= 50 ? "in need of a little care" : "asking for attention";
  return {
    summary: `Your skin reads as ${type} and overall ${quality}, with a skin score of ${score}/100.`,
    observations: obs,
  };
}

export function describeScalp(m: ScalpMetrics, type: string): { summary: string; observations: string[] } {
  const obs: string[] = [];
  if (m.oiliness > 60) obs.push("Sebum levels are elevated along the parting.");
  if (m.hydration < 50) obs.push("The scalp appears dry and may feel tight.");
  if (m.flaking > 45) obs.push("Visible flakes were detected near the follicles.");
  if (m.sensitivity > 45) obs.push("Redness suggests scalp sensitivity or irritation.");
  if (m.density < 50) obs.push("Hair density appears lower in the scanned area.");
  if (m.follicle_health > 70) obs.push("Follicles look clear and healthy.");
  if (obs.length === 0) obs.push("Your scalp looks balanced and comfortable.");
  const score = scalpOverallScore(m);
  return {
    summary: `Your scalp reads as ${type}, with a scalp score of ${score}/100.`,
    observations: obs,
  };
}

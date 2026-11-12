import { describe, expect, it } from "vitest";
import {
  checkQuality,
  classifySkinType,
  extractFeatures,
  scalpMetricsFromFeatures,
  scalpOverallScore,
  skinHealth,
  skinMetricsFromFeatures,
  skinOverallScore,
  type ImageFeatures,
} from "@/lib/analysis/engine";

function solid(w: number, h: number, rgb: [number, number, number]) {
  const buf = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) buf.set(rgb, i * 3);
  return buf;
}

function noisy(w: number, h: number, base: [number, number, number], amp: number, seed = 1) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const buf = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const n = rnd() * amp;
    buf[i * 3] = Math.max(0, Math.min(255, base[0] + n));
    buf[i * 3 + 1] = Math.max(0, Math.min(255, base[1] + n));
    buf[i * 3 + 2] = Math.max(0, Math.min(255, base[2] + n));
  }
  return buf;
}

const SKIN: [number, number, number] = [224, 172, 150];

describe("extractFeatures", () => {
  it("detects skin tones", () => {
    const f = extractFeatures(solid(32, 32, SKIN), 32, 32);
    expect(f.skinRatio).toBeGreaterThan(0.9);
    expect(f.texture).toBe(0);
  });

  it("reports darkness", () => {
    const f = extractFeatures(solid(16, 16, [5, 5, 5]), 16, 16);
    expect(f.brightness).toBeLessThan(0.05);
    expect(f.darkRatio).toBe(1);
    expect(checkQuality(f, "skin")).toBe("too_dark");
  });

  it("measures more texture on noisy images", () => {
    const smooth = extractFeatures(noisy(64, 64, SKIN, 4), 64, 64);
    const rough = extractFeatures(noisy(64, 64, SKIN, 40), 64, 64);
    expect(rough.texture).toBeGreaterThan(smooth.texture);
  });

  it("rejects invalid buffers", () => {
    expect(() => extractFeatures(new Uint8Array(10), 10, 10)).toThrow();
  });
});

describe("quality gate", () => {
  it("flags images without a face", () => {
    const f = extractFeatures(noisy(32, 32, [40, 90, 200], 30), 32, 32);
    expect(checkQuality(f, "skin")).toBe("no_skin_detected");
    expect(checkQuality(f, "scalp")).toBeNull();
  });
  it("flags overexposure", () => {
    const f = extractFeatures(solid(16, 16, [255, 255, 255]), 16, 16);
    expect(checkQuality(f, "scalp")).toBe("overexposed");
  });
});

const base: ImageFeatures = { brightness: 0.6, contrast: 0.1, texture: 0.01, redness: 0.05, highlights: 0.01, darkSpots: 0.01, saturation: 0.3, skinRatio: 0.6, darkRatio: 0.05 };

describe("skin metrics", () => {
  it("keeps all metrics within 0..100", () => {
    for (const f of [base, { ...base, texture: 1, highlights: 1, redness: 1, darkSpots: 1, contrast: 1, brightness: 0 }]) {
      const m = skinMetricsFromFeatures(f);
      Object.values(m).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
        expect(Number.isInteger(v)).toBe(true);
      });
    }
  });

  it("raises oiliness with shine and redness with red dominance", () => {
    const a = skinMetricsFromFeatures(base);
    const shiny = skinMetricsFromFeatures({ ...base, highlights: 0.1 });
    const red = skinMetricsFromFeatures({ ...base, redness: 0.2 });
    expect(shiny.oiliness).toBeGreaterThan(a.oiliness);
    expect(red.redness).toBeGreaterThan(a.redness);
  });

  it("gives a lower overall score to troubled skin", () => {
    const healthy = skinMetricsFromFeatures(base);
    const troubled = skinMetricsFromFeatures({ ...base, texture: 0.06, redness: 0.22, darkSpots: 0.08, contrast: 0.3 });
    expect(skinOverallScore(troubled)).toBeLessThan(skinOverallScore(healthy));
  });

  it("treats moderate oil as healthiest", () => {
    const h40 = skinHealth({ hydration: 50, oiliness: 40, pores: 0, wrinkles: 0, redness: 0, pigmentation: 0, elasticity: 50 });
    const h90 = skinHealth({ hydration: 50, oiliness: 90, pores: 0, wrinkles: 0, redness: 0, pigmentation: 0, elasticity: 50 });
    expect(h40.oiliness).toBe(100);
    expect(h90.oiliness).toBeLessThan(h40.oiliness);
  });

  it("classifies skin types", () => {
    expect(classifySkinType({ hydration: 70, oiliness: 30, pores: 20, wrinkles: 20, redness: 70, pigmentation: 20, elasticity: 70 })).toBe("sensitive");
    expect(classifySkinType({ hydration: 70, oiliness: 80, pores: 20, wrinkles: 20, redness: 10, pigmentation: 20, elasticity: 70 })).toBe("oily");
    expect(classifySkinType({ hydration: 30, oiliness: 30, pores: 20, wrinkles: 20, redness: 10, pigmentation: 20, elasticity: 70 })).toBe("dry");
    expect(classifySkinType({ hydration: 30, oiliness: 80, pores: 20, wrinkles: 20, redness: 10, pigmentation: 20, elasticity: 70 })).toBe("combination");
    expect(classifySkinType({ hydration: 70, oiliness: 40, pores: 20, wrinkles: 20, redness: 10, pigmentation: 20, elasticity: 70 })).toBe("normal");
  });
});

describe("scalp metrics", () => {
  it("raises flaking with white highlights", () => {
    const a = scalpMetricsFromFeatures(base);
    const flaky = scalpMetricsFromFeatures({ ...base, highlights: 0.1 });
    expect(flaky.flaking).toBeGreaterThan(a.flaking);
    expect(scalpOverallScore(flaky)).toBeLessThan(scalpOverallScore(a));
  });
});

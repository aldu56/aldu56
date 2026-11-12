import { describe, expect, it } from "vitest";
import { scalpRecommendations, scalpRoutine, skinRecommendations, skinRoutine } from "@/lib/analysis/recommendations";
import { getProduct } from "@/lib/catalog";

const goodSkin = { hydration: 80, oiliness: 40, pores: 20, wrinkles: 15, redness: 10, pigmentation: 15, elasticity: 80 };
const badSkin = { hydration: 30, oiliness: 85, pores: 70, wrinkles: 60, redness: 70, pigmentation: 65, elasticity: 40 };

describe("skin recommendations", () => {
  it("always includes sun protection", () => {
    expect(skinRecommendations(goodSkin).map((r) => r.product_slug)).toEqual(["solaire-spf50"]);
  });
  it("addresses every concern, sorted by priority, with real products", () => {
    const r = skinRecommendations(badSkin);
    expect(r.length).toBeGreaterThanOrEqual(6);
    expect(r[0].priority).toBe(1);
    for (let i = 1; i < r.length; i++) expect(r[i].priority).toBeGreaterThanOrEqual(r[i - 1].priority);
    r.forEach((x) => x.product_slug && expect(getProduct(x.product_slug)).toBeDefined());
  });
  it("builds morning, evening and weekly routines", () => {
    const steps = skinRoutine(badSkin);
    expect(new Set(steps.map((s) => s.time_of_day))).toEqual(new Set(["morning", "evening", "weekly"]));
    expect(steps.some((s) => s.product_slug === "renew-retinal-night")).toBe(true);
    expect(skinRoutine(goodSkin).some((s) => s.product_slug === "renew-retinal-night")).toBe(false);
  });
});

describe("scalp recommendations", () => {
  const bad = { hydration: 30, oiliness: 80, flaking: 70, sensitivity: 65, density: 40, follicle_health: 40 };
  const good = { hydration: 75, oiliness: 35, flaking: 10, sensitivity: 10, density: 80, follicle_health: 85 };
  it("targets each scalp concern", () => {
    const slugs = scalpRecommendations(bad).map((r) => r.product_slug);
    expect(slugs).toEqual(expect.arrayContaining(["scalp-purify-shampoo", "scalp-hydra-elixir", "clarifying-scalp-scrub", "soothing-scalp-tonic", "follicle-vital-serum"]));
    scalpRecommendations(bad).forEach((x) => x.product_slug && expect(getProduct(x.product_slug)).toBeDefined());
  });
  it("keeps a balanced scalp plan light", () => {
    expect(scalpRecommendations(good)).toHaveLength(1);
    expect(scalpRoutine(good).every((s) => s.product_slug === null)).toBe(true);
  });
});

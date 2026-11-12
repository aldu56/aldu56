import type { ScalpMetrics, SkinMetrics } from "@/lib/types";

export interface RecommendationDraft {
  title: string;
  body: string;
  category: string;
  priority: 1 | 2 | 3;
  product_slug: string | null;
}

export interface RoutineDraft {
  time_of_day: "morning" | "evening" | "weekly";
  step_order: number;
  title: string;
  description: string;
  product_slug: string | null;
}

export function skinRecommendations(m: SkinMetrics): RecommendationDraft[] {
  const out: RecommendationDraft[] = [];
  if (m.hydration < 55)
    out.push({
      title: "Restore deep hydration",
      body: "Apply a hyaluronic serum on damp skin morning and evening, then seal with moisturizer. Aim for 1.5–2 L of water daily.",
      category: "Hydration",
      priority: m.hydration < 40 ? 1 : 2,
      product_slug: "hydra-veil-serum",
    });
  if (m.oiliness > 60)
    out.push({
      title: "Balance excess sebum",
      body: "Cleanse twice daily with a low-pH gel containing niacinamide. Avoid heavy occlusive creams on the T-zone.",
      category: "Oil control",
      priority: m.oiliness > 75 ? 1 : 2,
      product_slug: "balance-gel-cleanser",
    });
  if (m.pores > 55)
    out.push({
      title: "Refine pore appearance",
      body: "Niacinamide and gentle weekly exfoliation help keep pores clear and visibly smaller.",
      category: "Texture",
      priority: 2,
      product_slug: "balance-gel-cleanser",
    });
  if (m.redness > 45)
    out.push({
      title: "Calm and protect your barrier",
      body: "Choose fragrance-free products and a ceramide-rich cream with centella. Pause strong actives until redness settles.",
      category: "Sensitivity",
      priority: m.redness > 60 ? 1 : 2,
      product_slug: "calm-cica-cream",
    });
  if (m.pigmentation > 50)
    out.push({
      title: "Even out your tone",
      body: "Use a stabilized vitamin C serum each morning and never skip SPF — UV exposure deepens dark spots.",
      category: "Radiance",
      priority: 2,
      product_slug: "lumiere-c-serum",
    });
  if (m.wrinkles > 45 || m.elasticity < 55)
    out.push({
      title: "Smooth fine lines overnight",
      body: "Introduce a retinal night treatment 2–3 evenings per week, increasing gradually as your skin adapts.",
      category: "Anti-aging",
      priority: 2,
      product_slug: "renew-retinal-night",
    });
  out.push({
    title: "Daily sun protection",
    body: "Broad-spectrum SPF 50 every morning, reapplied every two hours outdoors, is the single most effective skincare step.",
    category: "Protection",
    priority: 3,
    product_slug: "solaire-spf50",
  });
  return out.sort((a, b) => a.priority - b.priority);
}

export function scalpRecommendations(m: ScalpMetrics): RecommendationDraft[] {
  const out: RecommendationDraft[] = [];
  if (m.oiliness > 60)
    out.push({
      title: "Rebalance an oily scalp",
      body: "Wash every 1–2 days with a clarifying, sulfate-free shampoo. Massage the scalp, not the lengths, and rinse with lukewarm water.",
      category: "Oil control",
      priority: m.oiliness > 75 ? 1 : 2,
      product_slug: "scalp-purify-shampoo",
    });
  if (m.hydration < 55)
    out.push({
      title: "Comfort scalp dryness",
      body: "Apply a leave-in hydrating scalp elixir after washing and avoid very hot water and tight hairstyles.",
      category: "Hydration",
      priority: m.hydration < 40 ? 1 : 2,
      product_slug: "scalp-hydra-elixir",
    });
  if (m.flaking > 45)
    out.push({
      title: "Lift flakes and buildup",
      body: "Use a clarifying scalp scrub once a week, followed by gentle cleansing. Persistent flaking may benefit from a dermatologist's advice.",
      category: "Flaking",
      priority: m.flaking > 60 ? 1 : 2,
      product_slug: "clarifying-scalp-scrub",
    });
  if (m.sensitivity > 45)
    out.push({
      title: "Soothe scalp sensitivity",
      body: "Switch to fragrance-free formulas and apply a cooling, alcohol-free tonic to calm itching and redness.",
      category: "Sensitivity",
      priority: m.sensitivity > 60 ? 1 : 2,
      product_slug: "soothing-scalp-tonic",
    });
  if (m.density < 55 || m.follicle_health < 60)
    out.push({
      title: "Support follicle vitality",
      body: "A nightly caffeine and rosemary serum with a two-minute scalp massage stimulates circulation for fuller-looking hair.",
      category: "Density",
      priority: 2,
      product_slug: "follicle-vital-serum",
    });
  out.push({
    title: "Glide your comb daily",
    body: "A daily ÉLORIA Smart Comb session distributes natural oils and tracks how your scalp responds to your new routine.",
    category: "Habit",
    priority: 3,
    product_slug: null,
  });
  return out.sort((a, b) => a.priority - b.priority);
}

export function skinRoutine(m: SkinMetrics): RoutineDraft[] {
  const steps: RoutineDraft[] = [];
  const cleanser = m.oiliness > 55 ? "balance-gel-cleanser" : null;
  steps.push({ time_of_day: "morning", step_order: 1, title: "Cleanse", description: m.oiliness > 55 ? "Gel cleanser, 60 seconds" : "Rinse with lukewarm water or a milky cleanser", product_slug: cleanser });
  steps.push({
    time_of_day: "morning",
    step_order: 2,
    title: m.pigmentation > 50 ? "Vitamin C serum" : "Hydrating serum",
    description: "Press 3–4 drops into skin",
    product_slug: m.pigmentation > 50 ? "lumiere-c-serum" : "hydra-veil-serum",
  });
  steps.push({ time_of_day: "morning", step_order: 3, title: "Moisturize", description: m.redness > 45 ? "Barrier cream with centella" : "Light moisturizer", product_slug: m.redness > 45 ? "calm-cica-cream" : null });
  steps.push({ time_of_day: "morning", step_order: 4, title: "SPF 50", description: "Two finger-lengths for face and neck", product_slug: "solaire-spf50" });
  steps.push({ time_of_day: "evening", step_order: 1, title: "Double cleanse", description: "Remove SPF and makeup, then cleanse", product_slug: cleanser });
  steps.push({ time_of_day: "evening", step_order: 2, title: "Hydrating serum", description: "On damp skin", product_slug: "hydra-veil-serum" });
  if (m.wrinkles > 45 || m.elasticity < 55)
    steps.push({ time_of_day: "evening", step_order: 3, title: "Retinal treatment", description: "2–3 nights per week", product_slug: "renew-retinal-night" });
  steps.push({ time_of_day: "evening", step_order: 4, title: "Night cream", description: "Seal in hydration", product_slug: m.redness > 45 ? "calm-cica-cream" : null });
  steps.push({ time_of_day: "weekly", step_order: 1, title: "Smart Mirror scan", description: "Track your progress under the same lighting", product_slug: null });
  if (m.pores > 55 || m.oiliness > 60)
    steps.push({ time_of_day: "weekly", step_order: 2, title: "Gentle exfoliation", description: "Once a week, avoid on irritated areas", product_slug: null });
  return steps;
}

export function scalpRoutine(m: ScalpMetrics): RoutineDraft[] {
  const steps: RoutineDraft[] = [];
  steps.push({ time_of_day: "morning", step_order: 1, title: "Smart Comb glide", description: "Two minutes, root to tip", product_slug: null });
  if (m.hydration < 55) steps.push({ time_of_day: "morning", step_order: 2, title: "Hydra elixir", description: "A few drops along the parting", product_slug: "scalp-hydra-elixir" });
  if (m.sensitivity > 45) steps.push({ time_of_day: "morning", step_order: 3, title: "Soothing tonic", description: "Spray and pat onto the scalp", product_slug: "soothing-scalp-tonic" });
  steps.push({
    time_of_day: "evening",
    step_order: 1,
    title: "Scalp massage",
    description: "Two minutes with fingertips to boost circulation",
    product_slug: m.density < 55 || m.follicle_health < 60 ? "follicle-vital-serum" : null,
  });
  steps.push({ time_of_day: "weekly", step_order: 1, title: m.oiliness > 60 ? "Clarifying wash" : "Gentle wash", description: m.oiliness > 60 ? "Every 1–2 days" : "2–3 times per week", product_slug: m.oiliness > 60 ? "scalp-purify-shampoo" : null });
  if (m.flaking > 45) steps.push({ time_of_day: "weekly", step_order: 2, title: "Scalp scrub", description: "Once a week before washing", product_slug: "clarifying-scalp-scrub" });
  steps.push({ time_of_day: "weekly", step_order: 3, title: "Smart Comb scan", description: "Weekly progress check", product_slug: null });
  return steps;
}

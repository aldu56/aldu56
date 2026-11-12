import type { AnalysisKind, DeviceType } from "@/lib/types";

export type ProductCategory = "device" | "skincare" | "scalpcare";

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  category: ProductCategory;
  device?: DeviceType;
  for?: AnalysisKind;
  image: string;
  highlights: string[];
}

/**
 * Source of truth for prices. Checkout recomputes totals from this list on the
 * server, so client-side prices can never be tampered with.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "eloria-smart-mirror",
    name: "ÉLORIA Smart Mirror",
    tagline: "Your skin, read in light.",
    description:
      "A high-definition beauty mirror with a calibrated multispectral camera and studio-grade halo lighting. In under thirty seconds it maps hydration, texture, tone and fine lines, then builds a skincare ritual made only for you.",
    priceCents: 49900,
    category: "device",
    device: "mirror",
    image: "/images/products/eloria-smart-mirror.svg",
    highlights: ["7 skin metrics in 30 seconds", "Calibrated halo lighting", "Private, encrypted scans", "Personalized AM / PM rituals"],
  },
  {
    slug: "eloria-smart-comb",
    name: "ÉLORIA Smart Comb",
    tagline: "The scalp, finally understood.",
    description:
      "A sculpted rose-gold comb with a micro-lens scalp camera between its teeth. Glide it through your hair to measure oil balance, flaking, sensitivity and follicle vitality — and receive a scalp care plan in seconds.",
    priceCents: 24900,
    category: "device",
    device: "comb",
    image: "/images/products/eloria-smart-comb.svg",
    highlights: ["6 scalp metrics per glide", "200× micro-lens camera", "Gentle ionic teeth", "Weekly scalp reports"],
  },
  {
    slug: "eloria-duo",
    name: "ÉLORIA Duo — Mirror & Comb",
    tagline: "Complete beauty intelligence.",
    description:
      "The Smart Mirror and Smart Comb together, sharing one ÉLORIA account for a single, unified view of your skin and scalp.",
    priceCents: 67900,
    category: "device",
    image: "/images/products/eloria-duo.svg",
    highlights: ["Both devices, one account", "Save €69", "Unified beauty dashboard", "Priority concierge support"],
  },
  { slug: "hydra-veil-serum", name: "Hydra Veil Serum", tagline: "Triple hyaluronic hydration", description: "A weightless serum with three molecular weights of hyaluronic acid and panthenol to restore deep hydration.", priceCents: 6800, category: "skincare", for: "skin", image: "/images/products/serum.svg", highlights: ["Hyaluronic acid ×3", "Panthenol", "Fragrance free"] },
  { slug: "balance-gel-cleanser", name: "Balance Gel Cleanser", tagline: "Gentle sebum control", description: "A low-pH gel cleanser with niacinamide and zinc PCA to refine pores and balance shine without stripping.", priceCents: 3200, category: "skincare", for: "skin", image: "/images/products/cleanser.svg", highlights: ["Niacinamide", "Zinc PCA", "pH 5.5"] },
  { slug: "calm-cica-cream", name: "Calm Cica Cream", tagline: "Soothes redness", description: "A barrier cream with centella asiatica, ceramides and oat to calm visible redness and reinforce the skin barrier.", priceCents: 5400, category: "skincare", for: "skin", image: "/images/products/cream.svg", highlights: ["Centella asiatica", "Ceramides", "Colloidal oat"] },
  { slug: "lumiere-c-serum", name: "Lumière C Serum", tagline: "Brightens uneven tone", description: "Stabilized 15% vitamin C with ferulic acid to visibly fade dark spots and restore radiance.", priceCents: 7400, category: "skincare", for: "skin", image: "/images/products/serum-c.svg", highlights: ["15% vitamin C", "Ferulic acid", "Vitamin E"] },
  { slug: "renew-retinal-night", name: "Renew Retinal Night", tagline: "Smooths fine lines", description: "Encapsulated retinal with peptides for a smoother, firmer look by morning.", priceCents: 8200, category: "skincare", for: "skin", image: "/images/products/night.svg", highlights: ["0.05% retinal", "Peptides", "Squalane"] },
  { slug: "solaire-spf50", name: "Solaire SPF 50", tagline: "Invisible daily protection", description: "A sheer, broad-spectrum SPF 50 fluid that leaves no white cast.", priceCents: 3900, category: "skincare", for: "skin", image: "/images/products/spf.svg", highlights: ["SPF 50 PA++++", "No white cast", "Daily wear"] },
  { slug: "scalp-purify-shampoo", name: "Scalp Purify Shampoo", tagline: "Balances an oily scalp", description: "A sulfate-free clarifying shampoo with salicylic acid and green tea to rebalance sebum.", priceCents: 3400, category: "scalpcare", for: "scalp", image: "/images/products/shampoo.svg", highlights: ["Salicylic acid", "Green tea", "Sulfate free"] },
  { slug: "scalp-hydra-elixir", name: "Scalp Hydra Elixir", tagline: "Comforts a dry scalp", description: "A leave-in scalp essence with hyaluronic acid and squalane to relieve tightness.", priceCents: 4600, category: "scalpcare", for: "scalp", image: "/images/products/elixir.svg", highlights: ["Hyaluronic acid", "Squalane", "Leave-in"] },
  { slug: "clarifying-scalp-scrub", name: "Clarifying Scalp Scrub", tagline: "Lifts flakes", description: "A weekly scrub with fine sea salt and piroctone olamine to lift flakes and buildup.", priceCents: 3800, category: "scalpcare", for: "scalp", image: "/images/products/scrub.svg", highlights: ["Piroctone olamine", "Sea salt", "Weekly use"] },
  { slug: "follicle-vital-serum", name: "Follicle Vital Serum", tagline: "Supports density", description: "A nightly scalp serum with caffeine, rosemary and peptides to support fuller-looking hair.", priceCents: 5900, category: "scalpcare", for: "scalp", image: "/images/products/vital.svg", highlights: ["Caffeine", "Rosemary", "Biotinoyl peptide"] },
  { slug: "soothing-scalp-tonic", name: "Soothing Scalp Tonic", tagline: "Calms sensitivity", description: "A cooling tonic with bisabolol and allantoin to calm itch and visible irritation.", priceCents: 3600, category: "scalpcare", for: "scalp", image: "/images/products/tonic.svg", highlights: ["Bisabolol", "Allantoin", "Alcohol free"] },
];

export const SHIPPING_FREE_THRESHOLD_CENTS = 10000;
export const SHIPPING_FLAT_CENTS = 900;

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function computeTotals(items: { slug: string; quantity: number }[]) {
  const lines = items.map((i) => {
    const p = getProduct(i.slug);
    if (!p) throw new Error(`Unknown product: ${i.slug}`);
    return { product: p, quantity: i.quantity, lineCents: p.priceCents * i.quantity };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineCents, 0);
  const shipping = subtotal === 0 || subtotal >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

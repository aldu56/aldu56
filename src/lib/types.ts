export type DeviceType = "mirror" | "comb";
export type AnalysisKind = "skin" | "scalp";

export interface Profile {
  id: string;
  full_name: string | null;
  skin_type: string | null;
  hair_type: string | null;
  concerns: string[];
  birth_year: number | null;
  marketing_opt_in: boolean;
}

export interface Device {
  id: string;
  user_id: string;
  device_type: DeviceType;
  serial: string;
  nickname: string;
  firmware_version: string;
  paired_at: string;
  last_used_at: string | null;
}

export interface SkinMetrics {
  hydration: number;
  oiliness: number;
  pores: number;
  wrinkles: number;
  redness: number;
  pigmentation: number;
  elasticity: number;
}

export interface ScalpMetrics {
  hydration: number;
  oiliness: number;
  flaking: number;
  sensitivity: number;
  density: number;
  follicle_health: number;
}

export interface SkinAnalysis extends SkinMetrics {
  id: string;
  user_id: string;
  device_id: string | null;
  image_path: string | null;
  overall_score: number;
  skin_type: string;
  summary: string;
  observations: string[];
  source: "vision-engine" | "ai";
  created_at: string;
}

export interface ScalpAnalysis extends ScalpMetrics {
  id: string;
  user_id: string;
  device_id: string | null;
  image_path: string | null;
  overall_score: number;
  scalp_type: string;
  summary: string;
  observations: string[];
  source: "vision-engine" | "ai";
  created_at: string;
}

export interface Recommendation {
  id: string;
  kind: AnalysisKind;
  analysis_id: string;
  title: string;
  body: string;
  category: string;
  priority: number;
  product_slug: string | null;
  created_at: string;
}

export interface RoutineStep {
  id: string;
  kind: AnalysisKind;
  time_of_day: "morning" | "evening" | "weekly";
  step_order: number;
  title: string;
  description: string;
  product_slug: string | null;
  active: boolean;
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  shipping_name: string;
  shipping_city: string;
  shipping_country: string;
  created_at: string;
  order_items?: { product_slug: string; product_name: string; unit_price_cents: number; quantity: number }[];
}

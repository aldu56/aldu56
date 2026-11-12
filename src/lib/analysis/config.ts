import type { AnalysisKind, DeviceType } from "@/lib/types";
import { SCALP_LABELS, SKIN_LABELS, scalpHealth, skinHealth } from "./engine";

export interface KindConfig {
  kind: AnalysisKind;
  device: DeviceType;
  deviceName: string;
  table: "skin_analyses" | "scalp_analyses";
  title: string;
  typeField: "skin_type" | "scalp_type";
  labels: Record<string, string>;
  metricKeys: string[];
  health: (m: Record<string, number>) => Record<string, number>;
  productHref: string;
  serialPrefix: string;
}

export const KINDS: Record<AnalysisKind, KindConfig> = {
  skin: {
    kind: "skin",
    device: "mirror",
    deviceName: "Smart Mirror",
    table: "skin_analyses",
    title: "Skin",
    typeField: "skin_type",
    labels: SKIN_LABELS,
    metricKeys: Object.keys(SKIN_LABELS),
    health: (m) => skinHealth(m as never) as unknown as Record<string, number>,
    productHref: "/smart-mirror",
    serialPrefix: "ELM",
  },
  scalp: {
    kind: "scalp",
    device: "comb",
    deviceName: "Smart Comb",
    table: "scalp_analyses",
    title: "Scalp",
    typeField: "scalp_type",
    labels: SCALP_LABELS,
    metricKeys: Object.keys(SCALP_LABELS),
    health: (m) => scalpHealth(m as never) as unknown as Record<string, number>,
    productHref: "/smart-comb",
    serialPrefix: "ELC",
  },
};

export function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "Needs care";
}

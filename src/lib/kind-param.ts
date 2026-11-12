import { notFound } from "next/navigation";
import type { AnalysisKind } from "@/lib/types";

export function parseKind(k: string): AnalysisKind {
  if (k === "skin" || k === "scalp") return k;
  notFound();
}

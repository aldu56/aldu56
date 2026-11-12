import "server-only";
import { createClient } from "@/lib/supabase/server";
import { KINDS } from "@/lib/analysis/config";
import type { AnalysisKind, Recommendation, RoutineStep } from "@/lib/types";
import type { TrendPoint } from "@/components/charts/trend-chart";

export type AnyAnalysis = Record<string, unknown> & {
  id: string;
  overall_score: number;
  created_at: string;
  summary: string;
  observations: string[];
  image_path: string | null;
  source: string;
  device_id: string | null;
};

export async function getAnalyses(kind: AnalysisKind, limit = 30): Promise<AnyAnalysis[]> {
  const supabase = await createClient();
  const { data } = await supabase.from(KINDS[kind].table).select("*").order("created_at", { ascending: false }).limit(limit);
  return (data as AnyAnalysis[]) ?? [];
}

export async function getAnalysis(kind: AnalysisKind, id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from(KINDS[kind].table).select("*").eq("id", id).maybeSingle();
  return (data as AnyAnalysis) ?? null;
}

export async function getPreviousAnalysis(kind: AnalysisKind, before: string) {
  const supabase = await createClient();
  const { data } = await supabase.from(KINDS[kind].table).select("*").lt("created_at", before).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data as AnyAnalysis) ?? null;
}

export async function getRecommendations(analysisId: string): Promise<Recommendation[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("recommendations").select("*").eq("analysis_id", analysisId).order("priority");
  return (data as Recommendation[]) ?? [];
}

export async function getSignedImage(path: string | null) {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("scans").createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}

export async function getRoutine() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 35 * 864e5).toISOString().slice(0, 10);
  const [{ data: steps }, { data: completions }] = await Promise.all([
    supabase.from("routine_steps").select("*").eq("active", true).order("time_of_day").order("step_order"),
    supabase.from("routine_completions").select("step_id, completed_on").gte("completed_on", since),
  ]);
  return { steps: (steps as RoutineStep[]) ?? [], completions: (completions as { step_id: string; completed_on: string }[]) ?? [] };
}

export function toTrend(kind: AnalysisKind, analyses: AnyAnalysis[]): TrendPoint[] {
  const cfg = KINDS[kind];
  return [...analyses].reverse().map((a) => {
    const levels = Object.fromEntries(cfg.metricKeys.map((k) => [k, Number(a[k])]));
    const health = cfg.health(levels);
    return {
      date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(a.created_at)),
      Score: a.overall_score,
      ...health,
    };
  });
}

export function healthOf(kind: AnalysisKind, a: AnyAnalysis) {
  const cfg = KINDS[kind];
  return cfg.health(Object.fromEntries(cfg.metricKeys.map((k) => [k, Number(a[k])])));
}

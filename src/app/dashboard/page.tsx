import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, ScanFace, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { ScoreRing } from "@/components/charts/score-ring";
import { ScoreAreaChart } from "@/components/charts/trend-chart";
import { RoutineSummary } from "@/components/app/routine-summary";
import { getOwnership, getProfile } from "@/lib/data";
import { getAnalyses, getRecommendations, getRoutine, toTrend } from "@/lib/dashboard";
import { KINDS } from "@/lib/analysis/config";
import { getProduct } from "@/lib/catalog";
import type { AnalysisKind } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [{ hasMirror, hasComb, devices }, profile, routine] = await Promise.all([getOwnership(), getProfile(), getRoutine()]);
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const { welcome } = await searchParams;

  if (devices.length === 0) {
    return (
      <>
        <PageHeader eyebrow="My ÉLORIA" title={<>Welcome, {firstName}.</>} description="Pair your first device to begin. Each ÉLORIA device works on its own." />
        <div className="grid gap-6 md:grid-cols-2">
          {(["skin", "scalp"] as const).map((k) => {
            const p = getProduct(k === "skin" ? "eloria-smart-mirror" : "eloria-smart-comb")!;
            return (
              <Card key={k} className="overflow-hidden">
                <div className="relative aspect-[16/9] bg-ivory"><Image src={p.image} alt={p.name} fill className="object-cover" sizes="50vw" /></div>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild><Link href="/dashboard/devices"><Plus /> Pair my {KINDS[k].deviceName}</Link></Button>
                  <Button asChild variant="outline"><Link href={`/shop/${p.slug}`}>Shop</Link></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  const owned: AnalysisKind[] = [...(hasMirror ? (["skin"] as const) : []), ...(hasComb ? (["scalp"] as const) : [])];
  const data = await Promise.all(owned.map(async (k) => ({ kind: k, analyses: await getAnalyses(k, 12) })));
  const latestIds = data.map((d) => d.analyses[0]?.id).filter(Boolean) as string[];
  const recos = (await Promise.all(latestIds.map(getRecommendations))).flat().sort((a, b) => a.priority - b.priority).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        title={<>{welcome ? "Welcome" : "Hello"}, {firstName}.</>}
        description="Your beauty at a glance."
      />
      <div className={`grid gap-6 ${owned.length > 1 ? "xl:grid-cols-2" : ""}`}>
        {data.map(({ kind, analyses }) => {
          const cfg = KINDS[kind];
          const latest = analyses[0];
          const prev = analyses[1];
          const delta = latest && prev ? latest.overall_score - prev.overall_score : null;
          const Icon = kind === "skin" ? ScanFace : Waves;
          return (
            <Card key={kind}>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <p className="eyebrow flex items-center gap-2"><Icon className="size-3.5" /> {cfg.deviceName}</p>
                  <CardTitle className="mt-2">{cfg.title} score</CardTitle>
                </div>
                <Button asChild size="sm" variant="gold"><Link href={`/dashboard/${kind}/scan`}>New scan</Link></Button>
              </CardHeader>
              <CardContent>
                {latest ? (
                  <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                    <div className="flex flex-col items-center">
                      <ScoreRing score={latest.overall_score} size={150} />
                      {delta !== null && <p className={`mt-2 text-xs ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{delta >= 0 ? "+" : ""}{delta} since last scan</p>}
                      <p className="mt-1 text-[11px] text-cocoa-soft">{formatDate(latest.created_at)}</p>
                    </div>
                    <div className="min-w-0">
                      <ScoreAreaChart data={toTrend(kind, analyses)} height={180} />
                      <Link href={`/dashboard/${kind}`} className="mt-2 inline-flex items-center gap-1 text-sm text-rosegold-dark hover:gap-2 transition-all">Full {kind} report <ArrowRight className="size-4" /></Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-ivory p-8 text-center">
                    <p className="font-serif text-2xl">Ready for your first {kind} analysis?</p>
                    <p className="mt-2 text-sm text-cocoa-soft">It takes less than a minute.</p>
                    <Button asChild className="mt-6"><Link href={`/dashboard/${kind}/scan`}>Start my first scan</Link></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today&apos;s ritual</CardTitle>
            <Link href="/dashboard/routine" className="text-sm text-rosegold-dark hover:underline">Open ritual</Link>
          </CardHeader>
          <CardContent>
            <RoutineSummary steps={routine.steps} completions={routine.completions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-rosegold" /> Top recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recos.length === 0 ? (
              <p className="text-sm text-cocoa-soft">Complete an analysis to receive personalized recommendations.</p>
            ) : (
              <ul className="space-y-4">
                {recos.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-ivory/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-rosegold-dark">{r.kind} · {r.category}</p>
                    <p className="mt-1 font-serif text-lg">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-cocoa-soft">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {owned.length === 1 && (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-dashed border-champagne bg-white/50 p-6 sm:flex-row sm:items-center">
          <p className="text-sm text-cocoa-soft">
            Curious about your {owned[0] === "skin" ? "scalp" : "skin"}? The ÉLORIA {owned[0] === "skin" ? "Smart Comb" : "Smart Mirror"} joins this same account whenever you&apos;re ready — completely optional.
          </p>
          <Button asChild variant="outline" size="sm"><Link href={owned[0] === "skin" ? "/smart-comb" : "/smart-mirror"}>Discover</Link></Button>
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { LockedFeature } from "@/components/app/locked-feature";
import { ScoreRing } from "@/components/charts/score-ring";
import { MetricRadar } from "@/components/charts/metric-radar";
import { MetricTrendChart, ScoreAreaChart } from "@/components/charts/trend-chart";
import { MetricBars } from "@/components/charts/metric-bars";
import { getOwnership } from "@/lib/data";
import { getAnalyses, healthOf, toTrend } from "@/lib/dashboard";
import { KINDS, scoreLabel } from "@/lib/analysis/config";
import { parseKind } from "@/lib/kind-param";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const k = (await params).kind;
  return { title: k === "skin" ? "Skin" : k === "scalp" ? "Scalp" : "Not found" };
}

export default async function KindPage({ params }: { params: Promise<{ kind: string }> }) {
  const kind = parseKind((await params).kind);
  const cfg = KINDS[kind];
  const { hasMirror, hasComb } = await getOwnership();
  const owns = kind === "skin" ? hasMirror : hasComb;

  if (!owns) {
    return (
      <>
        <PageHeader eyebrow={cfg.deviceName} title={`${cfg.title} intelligence`} />
        <LockedFeature kind={kind} />
      </>
    );
  }

  const analyses = await getAnalyses(kind, 30);
  const latest = analyses[0];
  const previous = analyses[1];
  const action = <Button asChild variant="gold"><Link href={`/dashboard/${kind}/scan`}><Camera /> New {kind} scan</Link></Button>;

  if (!latest) {
    return (
      <>
        <PageHeader eyebrow={cfg.deviceName} title={`${cfg.title} intelligence`} actions={action} />
        <Card className="p-12 text-center">
          <p className="font-serif text-3xl">Your first {kind} analysis awaits.</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-cocoa-soft">
            {kind === "skin" ? "Stand in front of your Smart Mirror in soft, even light with a clean face." : "Part your hair and glide your Smart Comb slowly across the scalp."}
          </p>
          <Button asChild className="mt-8" size="lg"><Link href={`/dashboard/${kind}/scan`}>Start analysis</Link></Button>
        </Card>
      </>
    );
  }

  const health = healthOf(kind, latest);
  const prevHealth = previous ? healthOf(kind, previous) : null;
  const radar = cfg.metricKeys.map((k) => ({ metric: cfg.labels[k], value: health[k] }));
  const prevRadar = prevHealth ? cfg.metricKeys.map((k) => ({ metric: cfg.labels[k], value: prevHealth[k] })) : undefined;
  const trend = toTrend(kind, analyses);
  const type = String(latest[cfg.typeField]);

  return (
    <>
      <PageHeader eyebrow={cfg.deviceName} title={`${cfg.title} intelligence`} description={`${analyses.length} analys${analyses.length === 1 ? "is" : "es"} recorded`} actions={action} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Latest · {formatDate(latest.created_at)}</p>
            <CardTitle>{scoreLabel(latest.overall_score)} {kind} health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <ScoreRing score={latest.overall_score} size={170} />
            <div className="flex-1 space-y-3">
              <Badge variant="gold">{type} {kind}</Badge>
              <p className="text-sm leading-relaxed text-cocoa-soft">{latest.summary}</p>
              <Link href={`/dashboard/${kind}/${latest.id}`} className="inline-flex items-center gap-1 text-sm text-rosegold-dark hover:gap-2 transition-all">See full report <ArrowRight className="size-4" /></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent><MetricRadar data={radar} previous={prevRadar} /></CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Progress by metric</CardTitle></CardHeader>
          <CardContent><MetricTrendChart data={trend} metrics={cfg.metricKeys.map((k) => ({ key: k, label: cfg.labels[k] }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Metric health</CardTitle></CardHeader>
          <CardContent>
            <MetricBars items={cfg.metricKeys.map((k) => ({ label: cfg.labels[k], health: health[k], level: Number(latest[k]), delta: prevHealth ? health[k] - prevHealth[k] : null }))} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Overall score</CardTitle></CardHeader>
        <CardContent><ScoreAreaChart data={trend} /></CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y divide-ivory">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link href={`/dashboard/${kind}/${a.id}`} className="flex items-center gap-4 py-3 transition hover:bg-cream/60 rounded-xl px-2">
                  <span className="grid size-11 place-items-center rounded-full bg-ivory font-serif text-lg">{a.overall_score}</span>
                  <div className="flex-1">
                    <p className="text-sm">{formatDate(a.created_at, { dateStyle: "medium", timeStyle: "short" })}</p>
                    <p className="text-xs capitalize text-cocoa-soft">{String(a[cfg.typeField])} · {a.source === "ai" ? "AI analysis" : "Vision engine"}</p>
                  </div>
                  <ArrowRight className="size-4 text-cocoa-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

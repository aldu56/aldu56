import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/charts/score-ring";
import { MetricBars } from "@/components/charts/metric-bars";
import { MetricRadar } from "@/components/charts/metric-radar";
import { DeleteAnalysisButton } from "@/components/app/delete-analysis";
import { getAnalysis, getPreviousAnalysis, getRecommendations, getSignedImage, healthOf } from "@/lib/dashboard";
import { KINDS, scoreLabel } from "@/lib/analysis/config";
import { parseKind } from "@/lib/kind-param";
import { getProduct } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/site/add-to-cart";

export const metadata = { title: "Analysis report" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AnalysisDetail({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { kind: k, id } = await params;
  const kind = parseKind(k);
  if (!UUID.test(id)) notFound();
  const cfg = KINDS[kind];
  const analysis = await getAnalysis(kind, id);
  if (!analysis) notFound();
  const [recos, previous, imageUrl] = await Promise.all([getRecommendations(id), getPreviousAnalysis(kind, analysis.created_at), getSignedImage(analysis.image_path)]);
  const isNew = (await searchParams).new === "1";

  const health = healthOf(kind, analysis);
  const prevHealth = previous ? healthOf(kind, previous) : null;
  const delta = previous ? analysis.overall_score - previous.overall_score : null;

  return (
    <>
      <Link href={`/dashboard/${kind}`} className="inline-flex items-center gap-2 text-sm text-cocoa-soft hover:text-cocoa"><ArrowLeft className="size-4" /> {cfg.title} overview</Link>
      {isNew && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-champagne/40 to-ivory px-5 py-4 text-sm">
          <Sparkles className="size-5 text-rosegold" /> Analysis complete. Your ritual has been updated with today&apos;s results.
        </div>
      )}
      <div className="mt-6 mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">{formatDate(analysis.created_at, { dateStyle: "full", timeStyle: "short" })}</p>
          <h1 className="text-4xl sm:text-5xl">{cfg.title} report</h1>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline"><Link href={`/dashboard/${kind}/scan`}><Camera /> Scan again</Link></Button>
          <DeleteAnalysisButton kind={kind} id={analysis.id} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={`${cfg.title} capture`} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="grid aspect-[4/3] place-items-center bg-ivory text-sm text-cocoa-soft">Image unavailable</div>
          )}
          <CardContent className="flex items-center gap-6 pt-6">
            <ScoreRing score={analysis.overall_score} size={130} />
            <div className="space-y-2">
              <p className="font-serif text-2xl">{scoreLabel(analysis.overall_score)}</p>
              {delta !== null && <p className={`text-sm ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{delta >= 0 ? "+" : ""}{delta} vs. previous scan</p>}
              <div className="flex flex-wrap gap-2">
                <Badge variant="gold" className="capitalize">{String(analysis[cfg.typeField])}</Badge>
                <Badge variant="outline"><Cpu className="size-3" /> {analysis.source === "ai" ? "AI analysis" : "Vision engine"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>What we see</CardTitle></CardHeader>
          <CardContent>
            <p className="font-serif text-xl leading-snug">{analysis.summary}</p>
            <ul className="mt-5 space-y-3">
              {analysis.observations.map((o) => (
                <li key={o} className="flex gap-3 text-sm text-cocoa-soft"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-rosegold" />{o}</li>
              ))}
            </ul>
            <div className="mt-6">
              <MetricRadar
                height={260}
                data={cfg.metricKeys.map((m) => ({ metric: cfg.labels[m], value: health[m] }))}
                previous={prevHealth ? cfg.metricKeys.map((m) => ({ metric: cfg.labels[m], value: prevHealth[m] })) : undefined}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <p className="text-xs text-cocoa-soft">Health scores out of 100 — higher is better.</p>
          </CardHeader>
          <CardContent>
            <MetricBars items={cfg.metricKeys.map((m) => ({ label: cfg.labels[m], health: health[m], level: Number(analysis[m]), delta: prevHealth ? health[m] - prevHealth[m] : null }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recos.map((r) => {
                const p = r.product_slug ? getProduct(r.product_slug) : null;
                return (
                  <li key={r.id} className="rounded-2xl border border-champagne/50 p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.priority === 1 ? "warning" : r.priority === 2 ? "gold" : "outline"}>{r.priority === 1 ? "Priority" : r.category}</Badge>
                      {r.priority === 1 && <span className="text-[11px] uppercase tracking-[0.16em] text-cocoa-soft">{r.category}</span>}
                    </div>
                    <p className="mt-3 font-serif text-xl">{r.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-cocoa-soft">{r.body}</p>
                    {p && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ivory/70 px-4 py-3">
                        <Link href={`/shop/${p.slug}`} className="text-sm hover:text-rosegold-dark">{p.name} · <span className="text-cocoa-soft">{formatPrice(p.priceCents)}</span></Link>
                        <AddToCart slug={p.slug} name={p.name} size="sm" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

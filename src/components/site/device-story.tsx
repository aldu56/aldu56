import Image from "next/image";
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCart } from "./add-to-cart";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export interface DeviceStoryProps {
  product: Product;
  eyebrow: string;
  headline: React.ReactNode;
  intro: string;
  metrics: { name: string; desc: string }[];
  features: { icon: LucideIcon; title: string; body: string }[];
  steps: { title: string; body: string }[];
  specs: [string, string][];
  faqs: [string, string][];
}

export function DeviceStory({ product, eyebrow, headline, intro, metrics, features, steps, specs, faqs }: DeviceStoryProps) {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="animate-fade-up">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="text-6xl leading-[0.98] sm:text-7xl">{headline}</h1>
          <p className="mt-7 max-w-lg text-[16px] leading-relaxed text-cocoa-soft">{intro}</p>
          <p className="mt-8 font-serif text-3xl">{formatPrice(product.priceCents)}</p>
          <p className="text-xs text-cocoa-soft">Free express delivery · 2-year warranty · 30-day returns</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCart slug={product.slug} name={product.name} />
            <Button asChild variant="outline" size="lg"><Link href="/dashboard/devices">Pair my device</Link></Button>
          </div>
          <p className="mt-6 text-sm text-cocoa-soft">Works on its own — no other ÉLORIA device required.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-champagne/30 blur-3xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lux">
            <Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What it measures" title={`${metrics.length} metrics, one glance.`} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m, i) => (
              <Reveal key={m.name} delay={i * 60}>
                <div className="flex h-full gap-4 rounded-3xl bg-white p-6 shadow-soft">
                  <span className="gold-text font-serif text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-serif text-xl">{m.name}</p>
                    <p className="mt-1 text-sm text-cocoa-soft">{m.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="h-full rounded-3xl border border-champagne/50 p-8">
                <f.icon className="size-6 text-rosegold" />
                <h3 className="mt-6 text-2xl">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-cocoa py-24 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="eyebrow !text-champagne text-center">The ritual</p>
          <h2 className="mt-4 text-center text-5xl text-cream">Effortless, every day.</h2>
          <ol className="mt-16 grid gap-10 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-champagne/30 pt-6">
                <span className="font-serif text-5xl font-light text-champagne">{i + 1}</span>
                <p className="mt-3 font-serif text-2xl text-cream">{s.title}</p>
                <p className="mt-2 text-sm text-cream/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-4xl">Specifications</h2>
          <dl className="mt-8 divide-y divide-champagne/50 border-y border-champagne/50">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 gap-4 py-4 text-sm">
                <dt className="text-cocoa-soft">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 space-y-3">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm"><Check className="size-4 text-rosegold" /> {h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-4xl">Questions</h2>
          <div className="mt-8 divide-y divide-champagne/50 border-y border-champagne/50">
            {faqs.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-xl">
                  {q}
                  <span className="text-rosegold transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

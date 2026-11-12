import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Fingerprint, Layers, Lock, ScanFace, Sparkles, Waves, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { formatPrice } from "@/lib/utils";
import { getProduct } from "@/lib/catalog";

const mirror = getProduct("eloria-smart-mirror")!;
const comb = getProduct("eloria-smart-comb")!;
const duo = getProduct("eloria-duo")!;

const BENEFITS = [
  { icon: ScanFace, title: "Clinical-grade insight", body: "Seven skin and six scalp metrics measured under calibrated light, every single time." },
  { icon: Wand2, title: "Rituals made for you", body: "Morning, evening and weekly routines that evolve as your skin and scalp change." },
  { icon: Layers, title: "Progress you can see", body: "Elegant charts reveal how hydration, tone and scalp balance improve week after week." },
  { icon: Lock, title: "Private by design", body: "Encrypted scans stored in your personal vault. Delete any analysis, any time." },
];

const STEPS = [
  { n: "01", title: "Scan", body: "Stand before the Smart Mirror or glide the Smart Comb through your hair. A capture takes seconds." },
  { n: "02", title: "Understand", body: "The ÉLORIA vision engine analyses texture, tone, oil balance and more — and explains it beautifully." },
  { n: "03", title: "Transform", body: "Receive a personalized ritual and product edit, then watch your scores rise in your dashboard." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#fff_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#EDE3DA_0%,_transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-16">
          <div className="animate-fade-up">
            <p className="eyebrow mb-6">Beauty technology · Skin • Hair</p>
            <h1 className="text-6xl leading-[0.95] text-cocoa sm:text-7xl xl:text-8xl">
              Your beauty,
              <br />
              <em className="gold-text font-light">understood.</em>
            </h1>
            <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-cocoa-soft">
              Two intelligent devices, one refined platform. The ÉLORIA Smart Mirror reads your skin. The ÉLORIA Smart Comb reads your scalp. Own one, or both — each delivers its complete experience on its own.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="gold">
                <Link href="/shop">Discover the collection <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/devices">I own an ÉLORIA device</Link>
              </Button>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-champagne/60 pt-8">
              {[
                ["30s", "per analysis"],
                ["13", "beauty metrics"],
                ["1", "unified account"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-serif text-4xl text-cocoa">{v}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.2em] text-cocoa-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-10 rounded-full bg-champagne/30 blur-3xl" />
            <div className="relative grid grid-cols-5 gap-4">
              <div className="col-span-3 animate-float overflow-hidden rounded-[2.5rem] shadow-lux">
                <div className="relative aspect-[4/5]">
                  <Image src={mirror.image} alt="ÉLORIA Smart Mirror" fill priority className="object-cover" sizes="(max-width: 1024px) 60vw, 30vw" />
                  <div className="absolute inset-x-[18%] h-0.5 animate-scan bg-gradient-to-r from-transparent via-rosegold to-transparent shadow-[0_0_20px_#B99A83]" />
                </div>
              </div>
              <div className="col-span-2 mt-24 animate-float overflow-hidden rounded-[2rem] shadow-lux [animation-delay:1.5s]">
                <div className="relative aspect-[4/5]">
                  <Image src={comb.image} alt="ÉLORIA Smart Comb" fill priority className="object-cover" sizes="(max-width: 1024px) 40vw, 20vw" />
                </div>
              </div>
            </div>
            <div className="glass absolute -bottom-6 left-0 flex items-center gap-3 rounded-2xl border border-white/80 px-5 py-4 shadow-soft">
              <Sparkles className="size-5 text-rosegold" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cocoa-soft">Skin score</p>
                <p className="font-serif text-2xl">86 <span className="text-sm text-emerald-700">+7 this month</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="The devices" title={<>Two rituals. <em className="font-light">One</em> intelligence.</>} intro="Each ÉLORIA device is complete on its own — no need to buy both. Pair the one you own and enjoy its full experience in your ÉLORIA account." />
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {[
            { p: mirror, href: "/smart-mirror", icon: ScanFace, metrics: ["Hydration", "Oil balance", "Pores", "Fine lines", "Redness", "Even tone", "Elasticity"] },
            { p: comb, href: "/smart-comb", icon: Waves, metrics: ["Hydration", "Oil balance", "Flaking", "Sensitivity", "Density", "Follicle vitality"] },
          ].map(({ p, href, icon: Icon, metrics }, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <article className="group relative overflow-hidden rounded-[2.5rem] border border-champagne/50 bg-white shadow-soft transition duration-700 hover:shadow-lux">
                <div className="grid sm:grid-cols-2">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    <Image src={p.image} alt={p.name} fill className="object-cover transition duration-1000 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 25vw" />
                  </div>
                  <div className="flex flex-col p-8">
                    <Icon className="size-6 text-rosegold" />
                    <h3 className="mt-6 text-3xl leading-tight">{p.name.replace("ÉLORIA ", "")}</h3>
                    <p className="mt-2 font-serif text-lg italic text-cocoa-soft">{p.tagline}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {metrics.map((m) => (
                        <li key={m} className="rounded-full bg-ivory px-3 py-1 text-[11px] text-cocoa-soft">{m}</li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-end justify-between pt-8">
                      <p className="font-serif text-2xl">{formatPrice(p.priceCents)}</p>
                      <Link href={href} className="inline-flex items-center gap-2 text-sm text-rosegold-dark hover:gap-3 transition-all">
                        Explore <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why ÉLORIA" title="Luxury that listens." />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <div className="h-full rounded-3xl bg-white/80 p-8 shadow-soft">
                  <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-champagne to-rosegold text-white">
                    <b.icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-2xl">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title={<>From reflection to <em className="font-light">ritual</em>.</>} />
        <ol className="mt-16 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <li className="relative">
                <span className="gold-text font-serif text-7xl font-light">{s.n}</span>
                <h3 className="mt-2 text-3xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* TECHNOLOGY */}
      <section className="relative overflow-hidden bg-cocoa py-28 text-cream">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-rosegold/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow !text-champagne mb-5">Beauty technology</p>
            <h2 className="text-5xl leading-[1.05] text-cream">
              Engineered in light.
              <br />
              <em className="font-light text-champagne">Refined by intelligence.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-cream/75">
              A calibrated capture pipeline normalizes light and color, a photometric vision engine measures texture, shine, redness and tone, and optional AI interpretation turns numbers into guidance you can act on.
            </p>
            <Button asChild variant="outline" className="mt-10 border-champagne/40 text-cream hover:bg-cream/10 hover:text-cream">
              <Link href="/technology">Explore the technology</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { icon: Fingerprint, t: "Multispectral capture", d: "Halo lighting with a fixed color temperature for consistent results." },
              { icon: Droplets, t: "Photometric analysis", d: "Texture, specular shine and chromatic redness measured pixel by pixel." },
              { icon: Sparkles, t: "AI interpretation", d: "Context-aware insights written in clear, warm language." },
              { icon: Lock, t: "Encrypted vault", d: "Row-level security — only you can see your analyses." },
            ].map((f) => (
              <div key={f.t} className="rounded-3xl border border-cream/10 bg-cream/5 p-6 backdrop-blur">
                <f.icon className="size-5 text-champagne" />
                <p className="mt-5 font-serif text-xl text-cream">{f.t}</p>
                <p className="mt-2 text-xs leading-relaxed text-cream/65">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHOOSE */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Choose your ÉLORIA" title="Begin with what matters to you." intro="Mirror only, comb only or both — every customer enjoys the same elegant ÉLORIA account." />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[mirror, comb, duo].map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <Link href={`/shop/${p.slug}`} className={`group block h-full rounded-[2rem] border p-8 transition hover:-translate-y-1 hover:shadow-lux ${i === 2 ? "border-rosegold bg-gradient-to-b from-white to-ivory" : "border-champagne/50 bg-white"}`}>
                {i === 2 && <span className="eyebrow">Most complete</span>}
                <div className="relative mx-auto mt-4 aspect-square w-3/4">
                  <Image src={p.image} alt={p.name} fill className="rounded-3xl object-cover" sizes="(max-width: 768px) 70vw, 22vw" />
                </div>
                <h3 className="mt-8 text-2xl">{p.name}</h3>
                <p className="mt-1 text-sm text-cocoa-soft">{p.tagline}</p>
                <p className="mt-6 font-serif text-2xl">{formatPrice(p.priceCents)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-rosegold-dark">Shop now <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ["“My hydration score went from 48 to 79 in six weeks. Seeing the curve rise is addictive.”", "Camille, Paris · Smart Mirror"],
              ["“I only bought the comb. The scalp plan finally calmed my flaking — I didn't need anything else.”", "Sofia, Milan · Smart Comb"],
              ["“Having skin and scalp in one dashboard feels like a private beauty concierge.”", "Amira, Dubai · ÉLORIA Duo"],
            ].map(([q, a]) => (
              <figure key={a} className="rounded-3xl bg-white p-8 shadow-soft">
                <blockquote className="font-serif text-xl leading-snug italic text-cocoa">{q}</blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-rosegold-dark">{a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-28 text-center sm:px-6">
        <p className="eyebrow mb-5">Already an ÉLORIA owner?</p>
        <h2 className="text-5xl leading-tight sm:text-6xl">Pair your device in under a minute.</h2>
        <p className="mx-auto mt-5 max-w-xl text-cocoa-soft">Create your account, enter the serial number printed beneath your device, and your first analysis is moments away.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg"><Link href="/signup">Create my account</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/login">Sign in</Link></Button>
        </div>
      </section>
    </>
  );
}

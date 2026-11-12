import type { Metadata } from "next";
import { Brain, Camera, Cpu, Database, Lock, SlidersHorizontal } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export const metadata: Metadata = { title: "Technology", description: "Inside the ÉLORIA vision engine: calibrated capture, photometric analysis and AI interpretation." };

const PIPELINE = [
  { icon: Camera, t: "Calibrated capture", d: "Halo lighting at a fixed color temperature and auto-exposure lock give every scan the same conditions. Images are normalized, orientation-corrected and resized on our servers." },
  { icon: SlidersHorizontal, t: "Quality gate", d: "Before any analysis, ÉLORIA checks brightness, exposure, detail and — for the mirror — that a face is present, and asks you to retake if needed." },
  { icon: Cpu, t: "Photometric vision engine", d: "Pixel-level measurements of luminance texture (Laplacian energy), specular highlights, chromatic redness (YCbCr skin segmentation) and local dark spots become 0–100 metric levels." },
  { icon: Brain, t: "AI interpretation", d: "When enabled, a multimodal AI model reviews the capture alongside the photometric measurements and writes observations in warm, precise language. If it is unavailable, the vision engine answers alone." },
  { icon: Database, t: "Personal history", d: "Results, recommendations and routines are stored per analysis so your dashboard can chart real progress over time." },
  { icon: Lock, t: "Security", d: "Row-level security policies in PostgreSQL ensure only you can read your data. Device ownership is verified on the server for every analysis." },
];

export default function TechnologyPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6">
        <p className="eyebrow mb-5">Beauty technology</p>
        <h1 className="text-6xl leading-[1] sm:text-7xl">The science of <em className="gold-text font-light">seeing</em>.</h1>
        <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-relaxed text-cocoa-soft">Behind every ÉLORIA score is a carefully engineered pipeline — from the light that falls on your face to the words that explain what it reveals.</p>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <ol className="relative space-y-6 before:absolute before:left-6 before:top-0 before:h-full before:w-px before:bg-champagne">
          {PIPELINE.map((p, i) => (
            <Reveal key={p.t} delay={i * 60}>
              <li className="relative flex gap-6 pl-0">
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne to-rosegold text-white shadow-soft"><p.icon className="size-5" /></span>
                <div className="rounded-3xl bg-white p-7 shadow-soft">
                  <p className="eyebrow">Stage {i + 1}</p>
                  <h2 className="mt-2 text-3xl">{p.t}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{p.d}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
      <section className="bg-ivory py-24">
        <SectionHeading eyebrow="Independent by design" title="One platform. Any combination." intro="Your ÉLORIA account recognizes exactly which devices you own. Mirror owners see skin features, comb owners see scalp features, Duo owners see both — unified in a single dashboard." />
      </section>
    </>
  );
}

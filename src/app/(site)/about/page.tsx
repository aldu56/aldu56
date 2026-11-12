import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = { title: "Our Maison", description: "The story behind ÉLORIA SKIN • HAIR." };

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-12 text-center sm:px-6">
        <p className="eyebrow mb-5">The Maison</p>
        <h1 className="text-6xl leading-[1] sm:text-7xl">Where couture meets <em className="gold-text font-light">code</em>.</h1>
        <p className="mx-auto mt-8 max-w-2xl text-[16px] leading-relaxed text-cocoa-soft">
          ÉLORIA was born from a simple belief: true luxury is being understood. We bring together dermatological insight, optical engineering and thoughtful design to create objects that are as beautiful on a vanity as they are intelligent.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["Understanding", "Every recommendation begins with measurement — never with assumption."],
          ["Craft", "Rose-gold finishes, hand-polished glass and quiet, considered interfaces."],
          ["Respect", "Your data belongs to you. Private by default, deletable at will."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-3xl border border-champagne/50 bg-white p-8 shadow-soft">
            <h2 className="text-3xl">{t}</h2>
            <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{d}</p>
          </div>
        ))}
      </section>
      <section className="bg-ivory py-24">
        <SectionHeading eyebrow="Our promise" title="Beauty that adapts to you — not the other way around." />
      </section>
    </>
  );
}

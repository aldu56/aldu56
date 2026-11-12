import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const FAQ: [string, [string, string][]][] = [
  ["Devices & ownership", [
    ["Do I have to buy both devices?", "Never. The Smart Mirror and Smart Comb are fully independent. Each delivers its complete experience on its own; owning both simply unifies skin and scalp in one dashboard."],
    ["How do I pair my device?", "Sign in, open Devices, and enter the serial number: ELM-XXXX-XXXX for the mirror (under the base) or ELC-XXXX-XXXX for the comb (on the handle)."],
    ["I bought a second-hand device.", "Ask the previous owner to remove it from their account (Devices → Remove), then pair it to yours. Our concierge can help if needed."],
  ]],
  ["Analyses", [
    ["How accurate are the results?", "ÉLORIA measures under calibrated conditions for consistency. Results are cosmetic assessments designed to track trends, not medical diagnoses."],
    ["Can I delete my data?", "Yes. Any analysis and its image can be deleted from its detail page. Deleting your account removes everything."],
    ["How often should I scan?", "Weekly scans at the same time of day give the clearest progress curves."],
  ]],
  ["Orders", [
    ["Shipping", "Complimentary express shipping on orders over €100; otherwise €9."],
    ["Returns", "30-day returns on devices in original condition; unopened care products within 14 days."],
  ]],
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
      <p className="eyebrow mb-4 text-center">Help</p>
      <h1 className="text-center text-6xl">Questions, answered.</h1>
      {FAQ.map(([section, items]) => (
        <div key={section} className="mt-14">
          <h2 className="text-3xl">{section}</h2>
          <div className="mt-6 divide-y divide-champagne/50 border-y border-champagne/50">
            {items.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-xl">{q}<span className="text-rosegold transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

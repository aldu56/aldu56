import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-24 pt-12 text-sm leading-relaxed text-cocoa-soft sm:px-6">
      <h1 className="text-5xl text-cocoa">Terms of service</h1>
      <p>By creating an ÉLORIA account you agree to use the service for personal, non-commercial purposes. Analyses and recommendations are cosmetic guidance and do not constitute medical advice.</p>
      <p>Devices are covered by a two-year limited warranty. Orders are subject to availability and confirmation of payment.</p>
      <p className="text-xs">This template must be reviewed by legal counsel before launch.</p>
    </article>
  );
}

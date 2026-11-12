import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 pb-24 pt-12 text-sm leading-relaxed text-cocoa-soft sm:px-6">
      <h1 className="text-5xl text-cocoa">Privacy policy</h1>
      <p>ÉLORIA processes your account details, device serial numbers, skin and scalp images, and the analyses derived from them solely to provide the ÉLORIA service.</p>
      <h2 className="text-2xl text-cocoa">Storage & security</h2>
      <p>Images are stored in a private, per-user storage folder. Database row-level security ensures that only you can access your analyses. Data is encrypted in transit and at rest.</p>
      <h2 className="text-2xl text-cocoa">AI processing</h2>
      <p>When AI interpretation is enabled, your capture is sent to our AI provider for analysis and is not used to train models. You can delete any analysis at any time.</p>
      <h2 className="text-2xl text-cocoa">Your rights</h2>
      <p>You may access, export or delete your data at any time by contacting our concierge.</p>
      <p className="text-xs">This template must be reviewed by legal counsel before launch.</p>
    </article>
  );
}

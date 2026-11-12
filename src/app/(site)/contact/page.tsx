import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Concierge", description: "Contact the ÉLORIA beauty concierge." };

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
      <div>
        <p className="eyebrow mb-4">Concierge</p>
        <h1 className="text-6xl leading-[1]">How may we <em className="gold-text font-light">help?</em></h1>
        <p className="mt-6 text-cocoa-soft">Device setup, your routine, an order or a press enquiry — our beauty concierge replies within one business day.</p>
        <ul className="mt-10 space-y-5 text-sm">
          <li className="flex gap-3"><Mail className="size-5 text-rosegold" /> concierge@eloria.example</li>
          <li className="flex gap-3"><Clock className="size-5 text-rosegold" /> Monday – Saturday, 9:00 – 19:00 CET</li>
          <li className="flex gap-3"><MapPin className="size-5 text-rosegold" /> Maison ÉLORIA, Paris</li>
        </ul>
      </div>
      <div className="rounded-[2rem] bg-white p-8 shadow-soft sm:p-10">
        <ContactForm />
      </div>
    </section>
  );
}

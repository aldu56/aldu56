import Link from "next/link";
import { AtSign, Mail, PlayCircle } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const COLS = [
  { title: "Devices", links: [["/smart-mirror", "Smart Mirror"], ["/smart-comb", "Smart Comb"], ["/shop/eloria-duo", "The Duo"], ["/technology", "Technology"]] },
  { title: "Maison", links: [["/about", "Our story"], ["/shop", "Shop"], ["/contact", "Concierge"], ["/faq", "FAQ"]] },
  { title: "Account", links: [["/login", "Sign in"], ["/signup", "Create account"], ["/dashboard/devices", "Pair a device"], ["/dashboard/orders", "Orders"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-champagne/50 bg-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-6">
            <Logo className="items-start" />
            <p className="max-w-sm font-serif text-xl italic text-cocoa-soft">Your beauty, understood.</p>
            <NewsletterForm />
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-5">{c.title}</p>
              <ul className="space-y-3 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-cocoa-soft transition hover:text-cocoa">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="gold-line my-10" />
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-cocoa-soft sm:flex-row">
          <p>© {new Date().getFullYear()} ÉLORIA SKIN • HAIR. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-cocoa">Privacy</Link>
            <Link href="/terms" className="hover:text-cocoa">Terms</Link>
            <a href="#" aria-label="Instagram" className="hover:text-cocoa"><AtSign className="size-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-cocoa"><PlayCircle className="size-4" /></a>
            <Link href="/contact" aria-label="Email concierge" className="hover:text-cocoa"><Mail className="size-4" /></Link>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] text-cocoa-soft/70">ÉLORIA analyses are cosmetic assessments and do not replace professional medical advice.</p>
      </div>
    </footer>
  );
}

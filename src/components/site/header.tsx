"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/smart-mirror", label: "Smart Mirror" },
  { href: "/smart-comb", label: "Smart Comb" },
  { href: "/technology", label: "Technology" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Maison" },
  { href: "/contact", label: "Concierge" },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-500", scrolled ? "glass border-b border-champagne/40 py-2" : "bg-transparent py-4")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {NAV.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className={cn("text-[13px] tracking-wide transition hover:text-rosegold-dark", pathname.startsWith(n.href) ? "text-rosegold-dark" : "text-cocoa")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Logo />
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8" aria-label="Secondary">
            {NAV.slice(3).map((n) => (
              <Link key={n.href} href={n.href} className={cn("text-[13px] tracking-wide transition hover:text-rosegold-dark", pathname.startsWith(n.href) ? "text-rosegold-dark" : "text-cocoa")}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href={signedIn ? "/dashboard" : "/login"} className="p-1 hover:text-rosegold-dark" aria-label={signedIn ? "My ÉLORIA" : "Sign in"}>
            <User className="size-5" />
          </Link>
          <Link href="/cart" className="relative p-1 hover:text-rosegold-dark" aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag className="size-5" />
            {count > 0 && <span className="absolute -right-1.5 -top-1 grid size-4 place-items-center rounded-full bg-rosegold text-[10px] font-semibold text-white">{count}</span>}
          </Link>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-champagne/40 bg-cream px-6 py-6 animate-fade-up" aria-label="Mobile">
          <ul className="flex flex-col gap-4">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="font-serif text-2xl">{n.label}</Link>
              </li>
            ))}
            <li><Link href={signedIn ? "/dashboard" : "/login"} className="font-serif text-2xl text-rosegold-dark">{signedIn ? "My ÉLORIA" : "Sign in"}</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

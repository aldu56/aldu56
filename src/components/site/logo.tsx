import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <Link href="/" aria-label="ÉLORIA home" className={cn("group inline-flex flex-col items-center leading-none", className)}>
      <span className="font-serif text-[26px] tracking-[0.32em] text-cocoa transition group-hover:text-rosegold-dark">ÉLORIA</span>
      {subtitle && <span className="mt-1 text-[8.5px] font-medium tracking-[0.5em] text-rosegold">SKIN • HAIR</span>}
    </Link>
  );
}

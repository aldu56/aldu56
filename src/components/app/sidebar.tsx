"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarCheck, Cpu, LayoutDashboard, Lock, LogOut, Menu, Package, ScanFace, Store, UserRound, Waves, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  hasMirror: boolean;
  hasComb: boolean;
}

export function DashboardSidebar({ name, hasMirror, hasComb }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/skin", label: "Skin", icon: ScanFace, locked: !hasMirror },
    { href: "/dashboard/scalp", label: "Scalp", icon: Waves, locked: !hasComb },
    { href: "/dashboard/routine", label: "My ritual", icon: CalendarCheck },
    { href: "/dashboard/devices", label: "Devices", icon: Cpu },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ];

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
              active ? "bg-white text-cocoa shadow-soft" : "text-cocoa-soft hover:bg-white/60 hover:text-cocoa",
            )}
          >
            <it.icon className={cn("size-4", active ? "text-rosegold" : "")} />
            <span className="flex-1">{it.label}</span>
            {it.locked && <Lock className="size-3.5 text-cocoa-soft/60" aria-label="Device not paired" />}
          </Link>
        );
      })}
      <div className="gold-line my-4" />
      <Link href="/shop" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-cocoa-soft hover:bg-white/60 hover:text-cocoa">
        <Store className="size-4" /> Shop
      </Link>
      <form action={signOut} className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-cocoa-soft hover:bg-white/60 hover:text-cocoa cursor-pointer">
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-champagne/40 bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -ml-2"><Menu className="size-5" /></button>
        <Logo subtitle={false} />
        <span className="w-9" />
      </div>
      {open && <div className="fixed inset-0 z-40 bg-cocoa/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ivory px-5 py-8 transition-transform duration-500 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <Logo className="items-start" />
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu"><X className="size-5" /></button>
        </div>
        <div className="mb-6 rounded-2xl bg-white/70 px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-cocoa-soft">Welcome</p>
          <p className="truncate font-serif text-xl">{name}</p>
          <div className="mt-2 flex gap-1.5">
            {hasMirror && <span className="rounded-full bg-champagne/40 px-2 py-0.5 text-[10px]">Mirror</span>}
            {hasComb && <span className="rounded-full bg-champagne/40 px-2 py-0.5 text-[10px]">Comb</span>}
            {!hasMirror && !hasComb && <span className="text-[11px] text-cocoa-soft">No device paired yet</span>}
          </div>
        </div>
        {nav}
      </aside>
    </>
  );
}

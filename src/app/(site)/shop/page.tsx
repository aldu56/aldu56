import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, type ProductCategory } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/site/add-to-cart";

export const metadata: Metadata = { title: "Shop", description: "ÉLORIA devices and personalized skin & scalp care." };

const FILTERS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "device", label: "Devices" },
  { key: "skincare", label: "Skincare" },
  { key: "scalpcare", label: "Scalp care" },
];

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const active = FILTERS.find((f) => f.key === c)?.key ?? "all";
  const products = active === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow mb-4">The collection</p>
        <h1 className="text-6xl">Shop ÉLORIA</h1>
      </div>
      <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Product categories">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key === "all" ? "/shop" : `/shop?c=${f.key}`} className={cn("rounded-full px-5 py-2 text-sm transition", active === f.key ? "bg-cocoa text-cream" : "bg-ivory text-cocoa-soft hover:bg-mist")}>
            {f.label}
          </Link>
        ))}
      </nav>
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p.slug} className="group flex flex-col overflow-hidden rounded-[2rem] border border-champagne/50 bg-white shadow-soft transition hover:shadow-lux">
            <Link href={`/shop/${p.slug}`} className="relative block aspect-square overflow-hidden bg-ivory">
              <Image src={p.image} alt={p.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              {p.category === "device" && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">Device</span>}
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <Link href={`/shop/${p.slug}`}><h2 className="text-2xl leading-tight hover:text-rosegold-dark">{p.name}</h2></Link>
              <p className="mt-1 text-sm text-cocoa-soft">{p.tagline}</p>
              <div className="mt-auto flex items-center justify-between pt-6">
                <p className="font-serif text-2xl">{formatPrice(p.priceCents)}</p>
                <AddToCart slug={p.slug} name={p.name} size="sm" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

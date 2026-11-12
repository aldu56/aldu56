import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { PRODUCTS, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/site/add-to-cart";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const related = PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-cocoa-soft hover:text-cocoa"><ArrowLeft className="size-4" /> Back to shop</Link>
      <div className="mt-8 grid gap-14 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-ivory shadow-lux">
          <Image src={p.image} alt={p.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow">{p.category === "device" ? "Smart device" : p.category === "skincare" ? "Skincare" : "Scalp care"}</p>
          <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">{p.name}</h1>
          <p className="mt-2 font-serif text-xl italic text-cocoa-soft">{p.tagline}</p>
          <p className="mt-8 font-serif text-4xl">{formatPrice(p.priceCents)}</p>
          <p className="mt-6 leading-relaxed text-cocoa-soft">{p.description}</p>
          <ul className="mt-6 space-y-2">
            {p.highlights.map((h) => <li key={h} className="flex items-center gap-3 text-sm"><Check className="size-4 text-rosegold" />{h}</li>)}
          </ul>
          <AddToCart slug={p.slug} name={p.name} withQuantity className="mt-10" />
          {p.device && (
            <p className="mt-6 text-sm text-cocoa-soft">
              Works independently. Learn more about the <Link className="text-rosegold-dark underline" href={p.device === "mirror" ? "/smart-mirror" : "/smart-comb"}>{p.device === "mirror" ? "Smart Mirror" : "Smart Comb"}</Link>.
            </p>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-4xl">You may also love</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/shop/${r.slug}`} className="group rounded-3xl bg-white p-4 shadow-soft">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-ivory"><Image src={r.image} alt={r.name} fill className="object-cover transition group-hover:scale-105" sizes="33vw" /></div>
                <p className="mt-4 font-serif text-xl">{r.name}</p>
                <p className="text-sm text-cocoa-soft">{formatPrice(r.priceCents)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

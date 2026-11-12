"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart-context";
import { SHIPPING_FLAT_CENTS, SHIPPING_FREE_THRESHOLD_CENTS, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQuantity, remove, subtotalCents, ready } = useCart();
  const shipping = subtotalCents === 0 || subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;

  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-24"><div className="skeleton h-64" /></div>;

  if (items.length === 0)
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
        <ShoppingBag className="size-12 text-rosegold" />
        <h1 className="mt-6 text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-cocoa-soft">Discover the devices and care products made for your skin and scalp.</p>
        <Button asChild size="lg" className="mt-10"><Link href="/shop">Continue shopping</Link></Button>
      </section>
    );

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <h1 className="text-5xl">Your bag</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-champagne/50 border-y border-champagne/50">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <li key={i.slug} className="flex gap-5 py-6">
                <Link href={`/shop/${p.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ivory"><Image src={p.image} alt={p.name} fill className="object-cover" sizes="96px" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl">{p.name}</p>
                      <p className="text-xs text-cocoa-soft">{p.tagline}</p>
                    </div>
                    <p className="font-serif text-xl">{formatPrice(p.priceCents * i.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-champagne">
                      <button className="grid size-9 place-items-center cursor-pointer" onClick={() => setQuantity(i.slug, i.quantity - 1)} aria-label={`Decrease ${p.name}`}><Minus className="size-3.5" /></button>
                      <span className="w-6 text-center text-sm tabular-nums">{i.quantity}</span>
                      <button className="grid size-9 place-items-center cursor-pointer" onClick={() => setQuantity(i.slug, i.quantity + 1)} aria-label={`Increase ${p.name}`}><Plus className="size-3.5" /></button>
                    </div>
                    <button onClick={() => remove(i.slug)} className="inline-flex items-center gap-1 text-xs text-cocoa-soft hover:text-red-700 cursor-pointer"><Trash2 className="size-3.5" /> Remove</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="h-fit rounded-[2rem] bg-white p-8 shadow-soft">
          <h2 className="text-3xl">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-cocoa-soft">Subtotal</dt><dd>{formatPrice(subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-cocoa-soft">Shipping</dt><dd>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd></div>
            <div className="gold-line my-4" />
            <div className="flex justify-between font-serif text-2xl"><dt>Total</dt><dd>{formatPrice(subtotalCents + shipping)}</dd></div>
          </dl>
          {shipping > 0 && <p className="mt-4 text-xs text-cocoa-soft">Add {formatPrice(SHIPPING_FREE_THRESHOLD_CENTS - subtotalCents)} for complimentary shipping.</p>}
          <Button asChild size="lg" variant="gold" className="mt-8 w-full"><Link href="/checkout">Proceed to checkout</Link></Button>
          <Button asChild variant="link" className="mt-3 w-full"><Link href="/shop">Continue shopping</Link></Button>
        </aside>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

const STATUS: Record<Order["status"], { label: string; variant: "warning" | "gold" | "success" | "danger" | "default" }> = {
  pending: { label: "Awaiting payment", variant: "warning" },
  paid: { label: "Paid", variant: "gold" },
  shipped: { label: "Shipped", variant: "gold" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  const orders = (data as Order[]) ?? [];
  return (
    <>
      <PageHeader eyebrow="Account" title="Orders" />
      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
          <Package className="mx-auto size-10 text-rosegold" />
          <p className="mt-4 font-serif text-2xl">No orders yet</p>
          <Button asChild className="mt-6"><Link href="/shop">Visit the shop</Link></Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-cocoa-soft">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="font-serif text-xl">{formatDate(o.created_at, { dateStyle: "long" })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={STATUS[o.status].variant}>{STATUS[o.status].label}</Badge>
                  <p className="font-serif text-2xl">{formatPrice(o.total_cents, o.currency)}</p>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-ivory text-sm">
                {o.order_items?.map((i) => (
                  <li key={i.product_slug} className="flex justify-between py-2">
                    <span>{i.product_name} × {i.quantity}</span>
                    <span className="text-cocoa-soft">{formatPrice(i.unit_price_cents * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-cocoa-soft">Ship to {o.shipping_name}, {o.shipping_city}, {o.shipping_country}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

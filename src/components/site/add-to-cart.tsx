"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

export function AddToCart({ slug, name, withQuantity = false, className, size = "lg" }: { slug: string; name: string; withQuantity?: boolean; className?: string; size?: "sm" | "default" | "lg" }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {withQuantity && (
        <div className="flex h-13 items-center rounded-full border border-champagne bg-white">
          <button type="button" className="grid size-11 place-items-center text-cocoa-soft hover:text-cocoa cursor-pointer" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus className="size-4" /></button>
          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{qty}</span>
          <button type="button" className="grid size-11 place-items-center text-cocoa-soft hover:text-cocoa cursor-pointer" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity"><Plus className="size-4" /></button>
        </div>
      )}
      <Button
        size={size}
        variant="gold"
        onClick={() => {
          add(slug, qty);
          toast.success(`${name} added to your bag`, { action: { label: "View bag", onClick: () => router.push("/cart") } });
        }}
      >
        <ShoppingBag /> Add to bag
      </Button>
    </div>
  );
}

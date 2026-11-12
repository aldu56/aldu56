"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { useCart } from "@/components/site/cart-context";
import { checkoutSchema } from "@/lib/validation";
import { computeTotals, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { placeOrder } from "@/app/actions/commerce";

const formSchema = checkoutSchema.omit({ items: true });
type FormValues = z.input<typeof formSchema>;

const COUNTRIES = ["France", "Belgium", "Germany", "Italy", "Spain", "Netherlands", "Switzerland", "United Kingdom", "United Arab Emirates", "United States", "Canada", "Mexico", "Colombia", "Brazil"];

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const { items, clear, ready } = useCart();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { shippingName: defaultName, shippingCountry: "France" },
  });

  if (!ready) return <div className="skeleton mt-10 h-96" />;
  if (items.length === 0)
    return (
      <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-soft">
        <p className="font-serif text-2xl">Your bag is empty.</p>
        <Button asChild className="mt-6"><Link href="/shop">Visit the shop</Link></Button>
      </div>
    );

  const totals = computeTotals(items);

  return (
    <form
      noValidate
      className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]"
      onSubmit={handleSubmit(async (values) => {
        const res = await placeOrder({ ...values, items });
        if (!res.ok) return void toast.error(res.error);
        clear();
        router.push(`/checkout/success?order=${res.data!.orderId}`);
      })}
    >
      <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl">Delivery</h2>
        <div className="space-y-2">
          <Label htmlFor="shippingName">Full name</Label>
          <Input id="shippingName" autoComplete="name" aria-invalid={!!errors.shippingName} {...register("shippingName")} />
          <FieldError message={errors.shippingName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingAddress">Address</Label>
          <Input id="shippingAddress" autoComplete="street-address" aria-invalid={!!errors.shippingAddress} {...register("shippingAddress")} />
          <FieldError message={errors.shippingAddress?.message} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shippingCity">City</Label>
            <Input id="shippingCity" autoComplete="address-level2" aria-invalid={!!errors.shippingCity} {...register("shippingCity")} />
            <FieldError message={errors.shippingCity?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingPostalCode">Postal code</Label>
            <Input id="shippingPostalCode" autoComplete="postal-code" aria-invalid={!!errors.shippingPostalCode} {...register("shippingPostalCode")} />
            <FieldError message={errors.shippingPostalCode?.message} />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shippingCountry">Country</Label>
            <NativeSelect id="shippingCountry" {...register("shippingCountry")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </div>
        </div>
        <div className="rounded-2xl bg-ivory p-5 text-sm text-cocoa-soft">
          <p className="flex items-center gap-2 font-medium text-cocoa"><Lock className="size-4" /> Payment</p>
          <p className="mt-1">Your order is reserved and our concierge will send a secure payment link by email. Card payments via a PCI-compliant provider can be enabled — see the README.</p>
        </div>
      </div>
      <aside className="h-fit rounded-[2rem] bg-white p-8 shadow-soft">
        <h2 className="text-3xl">Your order</h2>
        <ul className="mt-6 space-y-3 text-sm">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return <li key={i.slug} className="flex justify-between gap-4"><span>{p.name} × {i.quantity}</span><span>{formatPrice(p.priceCents * i.quantity)}</span></li>;
          })}
        </ul>
        <div className="gold-line my-5" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-cocoa-soft">Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-cocoa-soft">Shipping</dt><dd>{totals.shipping === 0 ? "Complimentary" : formatPrice(totals.shipping)}</dd></div>
          <div className="flex justify-between pt-2 font-serif text-2xl"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
        </dl>
        <Button type="submit" variant="gold" size="lg" loading={isSubmitting} className="mt-8 w-full">Place order</Button>
      </aside>
    </form>
  );
}

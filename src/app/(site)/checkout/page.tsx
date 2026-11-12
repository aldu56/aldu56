import type { Metadata } from "next";
import { requireUser, getProfile } from "@/lib/data";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser();
  const profile = await getProfile();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <h1 className="text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-cocoa-soft">Signed in as {user.email}</p>
      <CheckoutForm defaultName={profile?.full_name ?? ""} />
    </section>
  );
}

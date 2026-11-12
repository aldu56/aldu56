"use server";
import { createClient } from "@/lib/supabase/server";
import { computeTotals } from "@/lib/catalog";
import { checkoutSchema, contactSchema, newsletterSchema, type CheckoutInput, type ContactInput } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function placeOrder(input: CheckoutInput): Promise<ActionResult<{ orderId: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to complete your order." };

  let totals;
  try {
    totals = computeTotals(parsed.data.items); // prices come from the server catalog only
  } catch {
    return { ok: false, error: "One of the items in your bag is no longer available." };
  }
  const d = parsed.data;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      subtotal_cents: totals.subtotal,
      shipping_cents: totals.shipping,
      total_cents: totals.total,
      shipping_name: d.shippingName,
      shipping_address: d.shippingAddress,
      shipping_city: d.shippingCity,
      shipping_postal_code: d.shippingPostalCode,
      shipping_country: d.shippingCountry,
      phone: d.phone || null,
    })
    .select("id")
    .single();
  if (error || !order) return { ok: false, error: "We couldn't place your order. Please try again." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    totals.lines.map((l) => ({
      order_id: order.id,
      product_slug: l.product.slug,
      product_name: l.product.name,
      unit_price_cents: l.product.priceCents,
      quantity: l.quantity,
    })),
  );
  if (itemsError) return { ok: false, error: "We couldn't save your order items. Please contact concierge." };
  return { ok: true, data: { orderId: order.id } };
}

export async function sendContactMessage(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert(parsed.data);
  if (error) return { ok: false, error: "Your message could not be sent. Please try again." };
  return { ok: true, message: "Thank you — our concierge will reply within one business day." };
}

export async function subscribeNewsletter(input: { email: string }): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });
  if (error && error.code !== "23505") return { ok: false, error: "Subscription failed. Please try again." };
  return { ok: true, message: "Welcome to the ÉLORIA circle." };
}

"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { forgotSchema, loginSchema, resetSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validation";
import type { ActionResult } from "./types";

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(input: LoginInput, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message === "Email not confirmed" ? "Please confirm your email first — check your inbox." : "Incorrect email or password." };
  redirect(safeNext(next));
}

export async function signUp(input: SignupInput): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${await origin()}/auth/callback?next=/dashboard/devices` },
  });
  if (error) return { ok: false, error: error.message.includes("registered") ? "An account with this email already exists." : error.message };
  if (data.session) redirect("/dashboard/devices?welcome=1");
  return { ok: true, data: { needsConfirmation: true } };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(input: { email: string }): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${await origin()}/auth/callback?next=/reset-password` });
  // Always succeed to avoid account enumeration.
  return { ok: true, message: "If an account exists for this email, a reset link is on its way." };
}

export async function updatePassword(input: { password: string; confirmPassword: string }): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: "Your reset link has expired. Please request a new one." };
  return { ok: true, message: "Password updated." };
}

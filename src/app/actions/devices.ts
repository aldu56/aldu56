"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pairDeviceSchema, renameDeviceSchema } from "@/lib/validation";
import type { Device } from "@/lib/types";
import type { ActionResult } from "./types";

const ERRORS: Record<string, string> = {
  serial_not_found: "We couldn't find this serial number. Check the label under your device or inside the box.",
  serial_already_claimed: "This device is already registered to another account. Contact concierge if you bought it second-hand.",
  not_authenticated: "Please sign in again.",
};

export async function pairDevice(input: { serial: string; nickname?: string }): Promise<ActionResult<Device>> {
  const parsed = pairDeviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_device", { p_serial: parsed.data.serial, p_nickname: parsed.data.nickname });
  if (error) {
    const key = Object.keys(ERRORS).find((k) => error.message.includes(k));
    return { ok: false, error: key ? ERRORS[key] : "Pairing failed. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: data as Device };
}

export async function renameDevice(input: { id: string; nickname: string }): Promise<ActionResult> {
  const parsed = renameDeviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("devices").update({ nickname: parsed.data.nickname }).eq("id", parsed.data.id);
  if (error) return { ok: false, error: "Could not rename the device." };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function unpairDevice(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("release_device", { p_device_id: id });
  if (error) return { ok: false, error: "Could not remove the device." };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

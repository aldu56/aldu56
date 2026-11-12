import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Device, Profile } from "@/lib/types";

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
});

export const getDevices = cache(async (): Promise<Device[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("devices").select("*").order("paired_at", { ascending: true });
  return (data as Device[]) ?? [];
});

export async function getOwnership() {
  const devices = await getDevices();
  return {
    devices,
    hasMirror: devices.some((d) => d.device_type === "mirror"),
    hasComb: devices.some((d) => d.device_type === "comb"),
  };
}

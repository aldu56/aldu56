"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const d = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.fullName,
      skin_type: d.skinType || null,
      hair_type: d.hairType || null,
      birth_year: d.birthYear ? Number(d.birthYear) : null,
      concerns: d.concerns,
      marketing_opt_in: d.marketingOptIn,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Could not save your profile." };
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function toggleRoutineStep(stepId: string, done: boolean, date: string): Promise<ActionResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Invalid date." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const res = done
    ? await supabase.from("routine_completions").upsert({ user_id: user.id, step_id: stepId, completed_on: date }, { onConflict: "step_id,completed_on", ignoreDuplicates: true })
    : await supabase.from("routine_completions").delete().eq("step_id", stepId).eq("completed_on", date);
  if (res.error) return { ok: false, error: "Could not update your routine." };
  revalidatePath("/dashboard/routine");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAnalysis(kind: "skin" | "scalp", id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const table = kind === "skin" ? "skin_analyses" : "scalp_analyses";
  const { data } = await supabase.from(table).select("image_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete this analysis." };
  await supabase.from("recommendations").delete().eq("analysis_id", id);
  if (data?.image_path) await supabase.storage.from("scans").remove([data.image_path]);
  revalidatePath(`/dashboard/${kind}`);
  return { ok: true };
}

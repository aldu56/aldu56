import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { ACCEPTED_TYPES, AnalysisError, MAX_UPLOAD_BYTES, analyzeScalp, analyzeSkin } from "@/lib/analysis/service";
import { scalpRecommendations, scalpRoutine, skinRecommendations, skinRoutine } from "@/lib/analysis/recommendations";

export const runtime = "nodejs";
export const maxDuration = 60;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (kind !== "skin" && kind !== "scalp") return fail(404, "Unknown analysis type.");
  const deviceType = kind === "skin" ? "mirror" : "comb";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "Please sign in to continue.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Invalid upload.");
  }

  // Ownership check: the customer must own the right device.
  const requestedDevice = form.get("deviceId");
  let deviceQuery = supabase.from("devices").select("id").eq("device_type", deviceType).eq("user_id", user.id);
  if (typeof requestedDevice === "string" && requestedDevice) deviceQuery = deviceQuery.eq("id", requestedDevice);
  const { data: device } = await deviceQuery.limit(1).maybeSingle();
  if (!device) {
    return fail(403, kind === "skin" ? "Pair an ÉLORIA Smart Mirror to run skin analyses." : "Pair an ÉLORIA Smart Comb to run scalp analyses.");
  }

  const file = form.get("image");
  if (!(file instanceof File)) return fail(400, "No image received.");
  if (!ACCEPTED_TYPES.includes(file.type)) return fail(415, "Please upload a JPEG, PNG or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES) return fail(413, "Images must be 8 MB or smaller.");

  const buffer = Buffer.from(await file.arrayBuffer());

  let result: Awaited<ReturnType<typeof analyzeSkin>> | Awaited<ReturnType<typeof analyzeScalp>>;
  let recos: ReturnType<typeof skinRecommendations>;
  let routine: ReturnType<typeof skinRoutine>;
  try {
    if (kind === "skin") {
      const r = await analyzeSkin(buffer);
      result = r;
      recos = skinRecommendations(r.metrics);
      routine = skinRoutine(r.metrics);
    } else {
      const r = await analyzeScalp(buffer);
      result = r;
      recos = scalpRecommendations(r.metrics);
      routine = scalpRoutine(r.metrics);
    }
  } catch (e) {
    if (e instanceof AnalysisError) return fail(422, e.message);
    console.error("[analysis] unexpected failure", e);
    return fail(500, "The analysis could not be completed. Please try again.");
  }

  // Store the normalized capture in the user's private folder.
  const imagePath = `${user.id}/${kind}/${randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage.from("scans").upload(imagePath, result.image, { contentType: "image/jpeg" });
  if (uploadError) console.error("[analysis] image upload failed", uploadError.message);

  const base = {
    user_id: user.id,
    device_id: device.id,
    image_path: uploadError ? null : imagePath,
    overall_score: result.overall,
    summary: result.summary,
    observations: result.observations,
    source: result.source,
    ...result.metrics,
  };
  const row: Record<string, unknown> = kind === "skin" ? { ...base, skin_type: result.type } : { ...base, scalp_type: result.type };

  const table = kind === "skin" ? "skin_analyses" : "scalp_analyses";
  const { data: inserted, error: insertError } = await supabase.from(table).insert(row).select("id").single();
  if (insertError || !inserted) {
    console.error("[analysis] insert failed", insertError?.message);
    return fail(500, "Your analysis could not be saved. Please try again.");
  }

  const [recoRes] = await Promise.all([
    supabase.from("recommendations").insert(recos.map((r) => ({ ...r, user_id: user.id, kind, analysis_id: inserted.id }))),
    supabase.from("routine_steps").update({ active: false }).eq("user_id", user.id).eq("kind", kind).eq("active", true),
    supabase.from("devices").update({ last_used_at: new Date().toISOString() }).eq("id", device.id),
  ]);
  if (recoRes.error) console.error("[analysis] recommendations insert failed", recoRes.error.message);

  const { error: routineError } = await supabase.from("routine_steps").insert(routine.map((s) => ({ ...s, user_id: user.id, kind })));
  if (routineError) console.error("[analysis] routine insert failed", routineError.message);

  return NextResponse.json({ id: inserted.id, overall: result.overall, source: result.source });
}

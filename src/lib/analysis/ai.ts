import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ScalpMetrics, SkinMetrics } from "@/lib/types";
import type { ImageFeatures } from "./engine";

const level = z.number().int().min(0).max(100);

const SkinSchema = z.object({
  valid_image: z.boolean().describe("false if the photo does not clearly show a human face"),
  issue: z.string().describe("If invalid, a short instruction for the user; otherwise empty"),
  hydration: level,
  oiliness: level,
  pores: level,
  wrinkles: level,
  redness: level,
  pigmentation: level,
  elasticity: level,
  skin_type: z.enum(["dry", "oily", "combination", "normal", "sensitive"]),
  summary: z.string(),
  observations: z.array(z.string()).max(6),
});

const ScalpSchema = z.object({
  valid_image: z.boolean().describe("false if the photo does not clearly show scalp or hair roots"),
  issue: z.string(),
  hydration: level,
  oiliness: level,
  flaking: level,
  sensitivity: level,
  density: level,
  follicle_health: level,
  scalp_type: z.enum(["dry", "oily", "balanced", "flaky", "sensitive"]),
  summary: z.string(),
  observations: z.array(z.string()).max(6),
});

export type AiSkinResult = z.infer<typeof SkinSchema>;
export type AiScalpResult = z.infer<typeof ScalpSchema>;

const SYSTEM = `You are the ÉLORIA beauty analysis engine. You assess cosmetic (non-medical) skin and scalp characteristics from photos captured by ÉLORIA smart devices.
Return metric LEVELS from 0 to 100:
- skin: hydration (higher = better hydrated), oiliness (amount of visible sebum/shine), pores (visibility), wrinkles (fine line visibility), redness, pigmentation (dark spots/uneven tone), elasticity (higher = firmer).
- scalp: hydration (higher = better), oiliness, flaking, sensitivity (redness/irritation), density (higher = denser hair), follicle_health (higher = healthier).
Base your assessment on the image; photometric measurements are supplied as supporting evidence. Write the summary and observations in warm, elegant, second-person English (one sentence each). Never diagnose disease; if something looks medically concerning, suggest seeing a dermatologist.`;

export function isAiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function run<T extends z.ZodType>(kind: "skin" | "scalp", schema: T, image: Buffer, mediaType: "image/jpeg", features: ImageFeatures) {
  const client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { effort: "low", format: zodOutputFormat(schema) },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image.toString("base64") } },
          { type: "text", text: `Analyze this ${kind} image. Photometric measurements: ${JSON.stringify(features)}` },
        ],
      },
    ],
  });
  if (response.stop_reason === "refusal") return null;
  return (response.parsed_output ?? null) as z.infer<T> | null;
}

export async function analyzeSkinWithAi(image: Buffer, features: ImageFeatures): Promise<AiSkinResult | null> {
  return run("skin", SkinSchema, image, "image/jpeg", features);
}

export async function analyzeScalpWithAi(image: Buffer, features: ImageFeatures): Promise<AiScalpResult | null> {
  return run("scalp", ScalpSchema, image, "image/jpeg", features);
}

export function pickSkinMetrics(r: AiSkinResult): SkinMetrics {
  const { hydration, oiliness, pores, wrinkles, redness, pigmentation, elasticity } = r;
  return { hydration, oiliness, pores, wrinkles, redness, pigmentation, elasticity };
}

export function pickScalpMetrics(r: AiScalpResult): ScalpMetrics {
  const { hydration, oiliness, flaking, sensitivity, density, follicle_health } = r;
  return { hydration, oiliness, flaking, sensitivity, density, follicle_health };
}

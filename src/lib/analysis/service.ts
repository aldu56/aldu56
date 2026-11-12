import "server-only";
import sharp from "sharp";
import type { ScalpMetrics, SkinMetrics } from "@/lib/types";
import {
  QUALITY_MESSAGES,
  checkQuality,
  classifyScalpType,
  classifySkinType,
  describeScalp,
  describeSkin,
  extractFeatures,
  scalpMetricsFromFeatures,
  scalpOverallScore,
  skinMetricsFromFeatures,
  skinOverallScore,
} from "./engine";
import { analyzeScalpWithAi, analyzeSkinWithAi, isAiEnabled, pickScalpMetrics, pickSkinMetrics } from "./ai";

export class AnalysisError extends Error {}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function prepare(input: Buffer) {
  let normalized: Buffer;
  try {
    normalized = await sharp(input).rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  } catch {
    throw new AnalysisError("This file could not be read as an image.");
  }
  const { data, info } = await sharp(normalized).resize(192, 192, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const features = extractFeatures(data, info.width, info.height, info.channels);
  return { normalized, features };
}

export interface SkinResult {
  metrics: SkinMetrics;
  overall: number;
  type: string;
  summary: string;
  observations: string[];
  source: "vision-engine" | "ai";
  image: Buffer;
}

export interface ScalpResult {
  metrics: ScalpMetrics;
  overall: number;
  type: string;
  summary: string;
  observations: string[];
  source: "vision-engine" | "ai";
  image: Buffer;
}

export async function analyzeSkin(input: Buffer): Promise<SkinResult> {
  const { normalized, features } = await prepare(input);
  const issue = checkQuality(features, "skin");
  if (issue) throw new AnalysisError(QUALITY_MESSAGES[issue]);

  if (isAiEnabled()) {
    try {
      const ai = await analyzeSkinWithAi(normalized, features);
      if (ai && !ai.valid_image) throw new AnalysisError(ai.issue || QUALITY_MESSAGES.no_skin_detected);
      if (ai) {
        const metrics = pickSkinMetrics(ai);
        return { metrics, overall: skinOverallScore(metrics), type: ai.skin_type, summary: ai.summary, observations: ai.observations, source: "ai", image: normalized };
      }
    } catch (e) {
      if (e instanceof AnalysisError) throw e;
      console.error("[analysis] AI skin analysis failed, falling back to vision engine", e);
    }
  }

  const metrics = skinMetricsFromFeatures(features);
  const type = classifySkinType(metrics);
  const { summary, observations } = describeSkin(metrics, type);
  return { metrics, overall: skinOverallScore(metrics), type, summary, observations, source: "vision-engine", image: normalized };
}

export async function analyzeScalp(input: Buffer): Promise<ScalpResult> {
  const { normalized, features } = await prepare(input);
  const issue = checkQuality(features, "scalp");
  if (issue) throw new AnalysisError(QUALITY_MESSAGES[issue]);

  if (isAiEnabled()) {
    try {
      const ai = await analyzeScalpWithAi(normalized, features);
      if (ai && !ai.valid_image) throw new AnalysisError(ai.issue || "We couldn't see your scalp clearly. Part your hair and glide again.");
      if (ai) {
        const metrics = pickScalpMetrics(ai);
        return { metrics, overall: scalpOverallScore(metrics), type: ai.scalp_type, summary: ai.summary, observations: ai.observations, source: "ai", image: normalized };
      }
    } catch (e) {
      if (e instanceof AnalysisError) throw e;
      console.error("[analysis] AI scalp analysis failed, falling back to vision engine", e);
    }
  }

  const metrics = scalpMetricsFromFeatures(features);
  const type = classifyScalpType(metrics);
  const { summary, observations } = describeScalp(metrics, type);
  return { metrics, overall: scalpOverallScore(metrics), type, summary, observations, source: "vision-engine", image: normalized };
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { AnalysisKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_BYTES = 8 * 1024 * 1024;
const STAGES = ["Calibrating light", "Mapping texture", "Measuring tone & balance", "Composing your ritual"];

export function ScanCapture({ kind, devices }: { kind: AnalysisKind; devices: { id: string; nickname: string }[] }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [cameraError, setCameraError] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState(devices[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraState("idle");
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraError("Camera access isn't available in this browser. Upload a photo instead.");
      return;
    }
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: kind === "skin" ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState("live");
    } catch {
      setCameraState("error");
      setCameraError("We couldn't access your camera. Allow camera permission or upload a photo instead.");
    }
  }, [kind]);

  useEffect(() => () => stopCamera(), [stopCamera]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const setImage = (b: Blob) => {
    setError("");
    setBlob(b);
    setPreview(URL.createObjectURL(b));
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    if (kind === "skin") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1); // un-mirror the selfie preview
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((b) => b && (setImage(b), stopCamera()), "image/jpeg", 0.92);
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Please choose a JPEG, PNG or WebP image.");
    if (file.size > MAX_BYTES) return setError("Images must be 8 MB or smaller.");
    setImage(file);
  };

  const reset = () => {
    setBlob(null);
    setPreview(null);
    setError("");
  };

  const submit = async () => {
    if (!blob) return;
    setSubmitting(true);
    setError("");
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 1100);
    try {
      const form = new FormData();
      form.append("image", blob, blob instanceof File ? blob.name : "capture.jpg");
      form.append("deviceId", deviceId);
      const res = await fetch(`/api/analyses/${kind}`, { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "The analysis could not be completed.");
      setStage(STAGES.length - 1);
      const target = `/dashboard/${kind}/${json.id}?new=1`;
      router.push(target);
      // Safety net: if the soft navigation is dropped, fall back to a full page load.
      setTimeout(() => {
        if (window.location.pathname.endsWith("/scan")) window.location.assign(target);
      }, 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    } finally {
      clearInterval(timer);
    }
  };

  if (submitting) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center shadow-soft">
        <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-full border-4 border-champagne bg-ivory">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          {preview && <img src={preview} alt="" className="h-full w-full object-cover opacity-80" />}
          <div className="absolute inset-x-0 h-0.5 animate-scan bg-gradient-to-r from-transparent via-rosegold to-transparent shadow-[0_0_24px_#B99A83]" />
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 font-serif text-2xl"><Sparkles className="size-5 text-rosegold" /> {STAGES[stage]}…</p>
        <Progress value={((stage + 1) / STAGES.length) * 100} className="mt-6" />
        <p className="mt-4 text-xs text-cocoa-soft">This usually takes a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="rounded-[2rem] bg-white p-6 shadow-soft">
        {preview ? (
          <div>
            <div className="relative mx-auto aspect-[4/3] max-h-[60vh] overflow-hidden rounded-3xl bg-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={preview} alt="Your capture" className="h-full w-full object-contain" />
              <button onClick={reset} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-soft cursor-pointer" aria-label="Remove image"><X className="size-4" /></button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={reset}><RefreshCw /> Retake</Button>
              <Button variant="gold" size="lg" onClick={submit}><Sparkles /> Analyze my {kind}</Button>
            </div>
          </div>
        ) : (
          <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); if (v === "upload") stopCamera(); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="camera"><Camera className="mr-2 inline size-4" />Camera</TabsTrigger>
              <TabsTrigger value="upload"><ImageUp className="mr-2 inline size-4" />Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="camera">
              <div className="relative mx-auto aspect-[4/3] overflow-hidden rounded-3xl bg-cocoa">
                <video ref={videoRef} playsInline muted className={cn("h-full w-full object-cover", kind === "skin" && "-scale-x-100", cameraState !== "live" && "invisible")} />
                {cameraState === "live" && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className={cn("border-2 border-dashed border-champagne/80 shadow-[0_0_0_9999px_rgba(73,53,43,0.35)]", kind === "skin" ? "h-[78%] w-[46%] rounded-[50%]" : "size-[60%] rounded-full")} />
                  </div>
                )}
                {cameraState !== "live" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-cream">
                    <Camera className="size-10 text-champagne" />
                    <p className="mt-4 font-serif text-2xl">{cameraState === "starting" ? "Opening camera…" : "Use your device camera"}</p>
                    {cameraError && <p className="mt-2 max-w-sm text-sm text-cream/80">{cameraError}</p>}
                    {cameraState !== "starting" && <Button variant="gold" className="mt-6" onClick={startCamera}>{cameraState === "error" ? "Try again" : "Start camera"}</Button>}
                  </div>
                )}
              </div>
              {cameraState === "live" && (
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                  <Button size="lg" onClick={capture}><Camera /> Capture</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="upload">
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
                className={cn("flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition", dragging ? "border-rosegold bg-ivory" : "border-champagne bg-cream/60 hover:bg-ivory")}
              >
                <ImageUp className="size-10 text-rosegold" />
                <p className="mt-4 font-serif text-2xl">Drop a photo or browse</p>
                <p className="mt-1 text-xs text-cocoa-soft">JPEG, PNG or WebP · up to 8 MB</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </TabsContent>
          </Tabs>
        )}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      </div>

      <aside className="space-y-6">
        {devices.length > 1 && (
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <label htmlFor="device" className="text-xs uppercase tracking-[0.18em] text-cocoa-soft">Device</label>
            <NativeSelect id="device" className="mt-2" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              {devices.map((d) => <option key={d.id} value={d.id}>{d.nickname}</option>)}
            </NativeSelect>
          </div>
        )}
        <div className="rounded-3xl bg-ivory p-6">
          <p className="font-serif text-2xl">For the best results</p>
          <ul className="mt-4 space-y-3 text-sm text-cocoa-soft">
            {(kind === "skin"
              ? ["Cleanse your face and remove makeup.", "Face soft, even light — avoid backlight.", "Look straight ahead with a neutral expression.", "Scan at the same time of day each week."]
              : ["Use dry, product-free hair.", "Part your hair at the crown or temples.", "Hold the lens close to the scalp.", "Scan the same zone each week."]
            ).map((t) => (
              <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-rosegold" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="px-2 text-xs text-cocoa-soft">Your image is stored privately in your personal vault. ÉLORIA analyses are cosmetic and not a medical diagnosis.</p>
      </aside>
    </div>
  );
}

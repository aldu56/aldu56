import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINDS } from "@/lib/analysis/config";
import { getProduct } from "@/lib/catalog";
import type { AnalysisKind } from "@/lib/types";

export function LockedFeature({ kind }: { kind: AnalysisKind }) {
  const cfg = KINDS[kind];
  const product = getProduct(kind === "skin" ? "eloria-smart-mirror" : "eloria-smart-comb")!;
  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-champagne/50 bg-white shadow-soft">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] bg-ivory md:aspect-auto">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
        </div>
        <div className="flex flex-col justify-center p-10">
          <span className="grid size-12 place-items-center rounded-full bg-ivory"><Lock className="size-5 text-rosegold" /></span>
          <h2 className="mt-6 text-4xl">{cfg.title} analysis needs the {cfg.deviceName}</h2>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">
            Pair an ÉLORIA {cfg.deviceName} to unlock {kind} scans, progress charts and a personalized {kind} ritual. Everything else in your account keeps working without it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><Link href="/dashboard/devices">I have one — pair it</Link></Button>
            <Button asChild variant="outline"><Link href={cfg.productHref}>Discover the {cfg.deviceName}</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

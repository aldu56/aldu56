import { PageHeader } from "@/components/app/page-header";
import { LockedFeature } from "@/components/app/locked-feature";
import { ScanCapture } from "@/components/app/scan-capture";
import { getOwnership } from "@/lib/data";
import { KINDS } from "@/lib/analysis/config";
import { parseKind } from "@/lib/kind-param";

export const metadata = { title: "New scan" };

export default async function ScanPage({ params }: { params: Promise<{ kind: string }> }) {
  const kind = parseKind((await params).kind);
  const cfg = KINDS[kind];
  const { devices } = await getOwnership();
  const mine = devices.filter((d) => d.device_type === cfg.device);
  if (mine.length === 0) return <LockedFeature kind={kind} />;
  return (
    <>
      <PageHeader eyebrow={cfg.deviceName} title={`New ${kind} analysis`} description={kind === "skin" ? "Center your face in soft, even light. Remove glasses and pull hair back." : "Part your hair and hold the lens close to the scalp, at the crown or temples."} />
      <ScanCapture kind={kind} devices={mine.map((d) => ({ id: d.id, nickname: d.nickname }))} />
    </>
  );
}

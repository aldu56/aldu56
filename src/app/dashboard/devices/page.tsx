import Image from "next/image";
import { PageHeader } from "@/components/app/page-header";
import { PairDeviceForm, DeviceCard } from "@/components/app/devices";
import { getOwnership } from "@/lib/data";
import { getProduct } from "@/lib/catalog";

export const metadata = { title: "Devices" };

export default async function DevicesPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { devices } = await getOwnership();
  const { welcome } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Devices"
        title={welcome ? "Welcome to ÉLORIA" : "My devices"}
        description={welcome ? "Your account is ready. Pair the device you own to unlock its experience — you never need both." : "Pair, rename or transfer your ÉLORIA devices."}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {devices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-champagne bg-white/60 p-10 text-center">
              <p className="font-serif text-2xl">No device paired yet</p>
              <p className="mt-2 text-sm text-cocoa-soft">Enter the serial number of your Smart Mirror or Smart Comb to begin.</p>
            </div>
          ) : (
            devices.map((d) => <DeviceCard key={d.id} device={d} image={getProduct(d.device_type === "mirror" ? "eloria-smart-mirror" : "eloria-smart-comb")!.image} />)
          )}
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-7 shadow-soft">
            <h2 className="text-3xl">Pair a device</h2>
            <p className="mt-1 text-sm text-cocoa-soft">Each serial can belong to one account.</p>
            <PairDeviceForm />
          </div>
          <div className="rounded-3xl bg-ivory p-7">
            <p className="font-serif text-xl">Where is my serial number?</p>
            <div className="mt-5 space-y-5 text-sm text-cocoa-soft">
              {[
                ["eloria-smart-mirror", "Smart Mirror", "Printed under the base", "ELM-XXXX-XXXX"],
                ["eloria-smart-comb", "Smart Comb", "Engraved on the handle", "ELC-XXXX-XXXX"],
              ].map(([slug, name, where, fmt]) => (
                <div key={slug} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white"><Image src={getProduct(slug)!.image} alt="" fill className="object-cover" sizes="64px" /></div>
                  <div>
                    <p className="text-cocoa">{name}</p>
                    <p>{where} · <span className="font-mono text-xs">{fmt}</span></p>
                  </div>
                </div>
              ))}
              <p className="text-xs">It also appears on the inside of the box lid.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

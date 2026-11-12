import type { Metadata } from "next";
import { Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { DeviceStory } from "@/components/site/device-story";
import { getProduct } from "@/lib/catalog";

export const metadata: Metadata = { title: "Smart Mirror", description: "The ÉLORIA Smart Mirror analyses your skin in 30 seconds and builds your personal skincare ritual." };

export default function SmartMirrorPage() {
  return (
    <DeviceStory
      product={getProduct("eloria-smart-mirror")!}
      eyebrow="ÉLORIA Smart Mirror"
      headline={<>Your skin, <em className="gold-text font-light">read in light.</em></>}
      intro="A sculpted beauty mirror with a calibrated camera and studio halo lighting. Look into it for thirty seconds and discover exactly what your skin needs — then follow a ritual designed for you alone."
      metrics={[
        { name: "Hydration", desc: "Moisture levels across the cheeks and forehead." },
        { name: "Oil balance", desc: "Sebum and shine distribution in the T-zone." },
        { name: "Pores", desc: "Visibility and size of pores." },
        { name: "Fine lines", desc: "Depth of expression lines around the eyes and brow." },
        { name: "Redness", desc: "Irritation, sensitivity and visible capillaries." },
        { name: "Even tone", desc: "Dark spots and pigmentation uniformity." },
        { name: "Elasticity", desc: "Firmness and bounce estimated from texture." },
      ]}
      features={[
        { icon: Lightbulb, title: "Calibrated halo light", body: "A fixed 5000K color temperature means every scan is comparable — your progress is real, not lighting." },
        { icon: Sparkles, title: "Personal rituals", body: "Morning, evening and weekly steps update automatically after each analysis." },
        { icon: ShieldCheck, title: "Private vault", body: "Captures are encrypted and visible only to you. Delete anything, any time." },
      ]}
      steps={[
        { title: "Illuminate", body: "Touch the frame to wake the halo light." },
        { title: "Scan", body: "Center your face; the capture takes seconds." },
        { title: "Discover", body: "Your skin score and 7 metrics appear in your account." },
        { title: "Glow", body: "Follow your ritual and track progress weekly." },
      ]}
      specs={[
        ["Display", "Ø 32 cm HD mirror glass"],
        ["Camera", "12 MP calibrated sensor"],
        ["Lighting", "Dimmable 5000K halo ring, CRI 97"],
        ["Connectivity", "Wi-Fi 6, Bluetooth 5.3"],
        ["Power", "USB-C, 6-week battery"],
        ["Finish", "Brushed rose-gold aluminium"],
      ]}
      faqs={[
        ["Do I need the Smart Comb?", "No. The Smart Mirror delivers its complete skin experience on its own. You can add the Smart Comb to the same account later if you wish."],
        ["How do I connect it?", "Create your ÉLORIA account, open Devices and enter the serial number printed under the base (ELM-XXXX-XXXX)."],
        ["Is it a medical device?", "No. ÉLORIA provides cosmetic skin assessments. For medical concerns, consult a dermatologist."],
        ["Can I upload a photo instead?", "Yes. Owners can capture with their phone or laptop camera, or upload a photo, while away from the mirror."],
      ]}
    />
  );
}

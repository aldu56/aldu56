import type { Metadata } from "next";
import { Microscope, ShieldCheck, Waves } from "lucide-react";
import { DeviceStory } from "@/components/site/device-story";
import { getProduct } from "@/lib/catalog";

export const metadata: Metadata = { title: "Smart Comb", description: "The ÉLORIA Smart Comb scans your scalp and delivers a personalized scalp care plan." };

export default function SmartCombPage() {
  return (
    <DeviceStory
      product={getProduct("eloria-smart-comb")!}
      eyebrow="ÉLORIA Smart Comb"
      headline={<>The scalp, <em className="gold-text font-light">finally understood.</em></>}
      intro="A rose-gold comb with a 200× micro-lens camera nestled between its teeth. Glide it through your hair to reveal oil balance, flaking, sensitivity and follicle vitality — and receive a scalp care plan in seconds."
      metrics={[
        { name: "Hydration", desc: "Scalp moisture and comfort." },
        { name: "Oil balance", desc: "Sebum along the parting and crown." },
        { name: "Flaking", desc: "Visible flakes and buildup near follicles." },
        { name: "Sensitivity", desc: "Redness and signs of irritation." },
        { name: "Density", desc: "Hair density in the scanned zone." },
        { name: "Follicle vitality", desc: "Overall follicle clarity and health." },
      ]}
      features={[
        { icon: Microscope, title: "200× micro-lens", body: "Sees what the eye can't — right at the root, illuminated by a ring of soft LEDs." },
        { icon: Waves, title: "Gentle ionic teeth", body: "Smooths the cuticle as you comb, so analysis is part of your daily routine." },
        { icon: ShieldCheck, title: "Private vault", body: "Scalp captures are encrypted and visible only to you." },
      ]}
      steps={[
        { title: "Part", body: "Part your hair at the crown or along the temples." },
        { title: "Glide", body: "Slowly glide the comb; it captures automatically." },
        { title: "Understand", body: "Your scalp score and 6 metrics appear instantly." },
        { title: "Restore", body: "Follow your scalp plan and re-scan weekly." },
      ]}
      specs={[
        ["Camera", "200× micro-lens, 8 MP"],
        ["Lighting", "6 polarized LEDs"],
        ["Teeth", "Ionic-coated, anti-static"],
        ["Connectivity", "Bluetooth 5.3, Wi-Fi"],
        ["Battery", "USB-C, 30 days per charge"],
        ["Weight", "68 g"],
      ]}
      faqs={[
        ["Do I need the Smart Mirror?", "No. The Smart Comb delivers its complete scalp experience on its own, in the same ÉLORIA account."],
        ["How do I connect it?", "Create your ÉLORIA account, open Devices and enter the serial number engraved on the handle (ELC-XXXX-XXXX)."],
        ["Does it work on all hair types?", "Yes — straight, wavy, curly and coily. For very dense hair, part sections before gliding."],
        ["Is it a medical device?", "No. ÉLORIA provides cosmetic assessments. Persistent symptoms deserve a dermatologist's opinion."],
      ]}
    />
  );
}

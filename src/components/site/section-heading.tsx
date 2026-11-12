import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, intro, align = "center", className }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="text-4xl leading-[1.05] text-cocoa sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 text-[15px] leading-relaxed text-cocoa-soft">{intro}</p>}
    </div>
  );
}

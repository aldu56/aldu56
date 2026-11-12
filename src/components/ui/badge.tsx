import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]", {
  variants: {
    variant: {
      default: "bg-ivory text-cocoa",
      gold: "bg-champagne/40 text-cocoa",
      outline: "border border-champagne text-cocoa-soft",
      success: "bg-emerald-50 text-emerald-800",
      warning: "bg-amber-50 text-amber-800",
      danger: "bg-rose-50 text-rose-800",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

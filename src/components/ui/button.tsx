import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-cocoa text-cream hover:bg-cocoa-soft shadow-soft",
        gold: "bg-gradient-to-r from-rosegold-dark via-rosegold to-champagne text-white shadow-soft hover:brightness-105 hover:shadow-lux",
        outline: "border border-cocoa/20 bg-transparent text-cocoa hover:border-rosegold hover:bg-white",
        ghost: "text-cocoa hover:bg-ivory",
        soft: "bg-ivory text-cocoa hover:bg-mist",
        link: "text-rosegold-dark underline-offset-4 hover:underline px-0",
        destructive: "bg-red-700/90 text-white hover:bg-red-700",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
  if (asChild) {
    return <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Slot>;
  }
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";
export { buttonVariants };

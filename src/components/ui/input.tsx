import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-champagne bg-white px-4 text-sm text-cocoa placeholder:text-cocoa/40 transition focus:border-rosegold focus:outline-none focus:ring-4 focus:ring-champagne/40 disabled:opacity-50 aria-[invalid=true]:border-red-400",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-32 w-full rounded-xl border border-champagne bg-white px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/40 transition focus:border-rosegold focus:outline-none focus:ring-4 focus:ring-champagne/40 aria-[invalid=true]:border-red-400",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full appearance-none rounded-xl border border-champagne bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23B99A83%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_1rem_center] bg-no-repeat px-4 text-sm text-cocoa focus:border-rosegold focus:outline-none focus:ring-4 focus:ring-champagne/40",
      className,
    )}
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";

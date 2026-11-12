"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("inline-flex rounded-full bg-ivory p-1", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn("rounded-full px-5 py-2 text-sm text-cocoa-soft transition data-[state=active]:bg-white data-[state=active]:text-cocoa data-[state=active]:shadow-soft cursor-pointer", className)}
      {...props}
    />
  );
}
export const TabsContent = TabsPrimitive.Content;

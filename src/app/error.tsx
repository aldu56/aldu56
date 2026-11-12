"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl">Something went wrong.</h1>
      <p className="mt-3 text-cocoa-soft">Please try again in a moment.</p>
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </div>
  );
}

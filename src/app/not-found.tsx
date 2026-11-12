import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="eyebrow mt-16">404</p>
      <h1 className="mt-4 text-6xl">This page has wandered off.</h1>
      <p className="mt-4 text-cocoa-soft">Let us guide you back.</p>
      <div className="mt-10 flex gap-3">
        <Button asChild><Link href="/">Home</Link></Button>
        <Button asChild variant="outline"><Link href="/shop">Shop</Link></Button>
      </div>
    </div>
  );
}

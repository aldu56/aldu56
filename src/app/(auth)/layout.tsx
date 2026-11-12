import Image from "next/image";
import { Logo } from "@/components/site/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ivory lg:block">
        <Image src="/images/products/eloria-smart-mirror.svg" alt="" fill className="object-cover" priority sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/60 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-cream">
          <p className="font-serif text-5xl leading-tight">Your beauty,<br /><em className="font-light">understood.</em></p>
          <p className="mt-4 max-w-sm text-sm text-cream/80">One account for your Smart Mirror, your Smart Comb — or both.</p>
        </div>
      </div>
      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Logo className="self-center lg:self-start" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </div>
    </div>
  );
}

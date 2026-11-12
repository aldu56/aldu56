import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <CheckCircle2 className="size-14 text-rosegold" />
      <h1 className="mt-6 text-5xl">Thank you.</h1>
      <p className="mt-4 text-cocoa-soft">Your order has been received. A confirmation and secure payment link will arrive by email shortly.</p>
      {order && <p className="mt-4 rounded-full bg-ivory px-4 py-2 font-mono text-xs">Order #{order.slice(0, 8).toUpperCase()}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/dashboard/orders">View my orders</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/devices">Pair a device</Link></Button>
      </div>
    </section>
  );
}

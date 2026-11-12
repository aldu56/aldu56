"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/app/actions/commerce";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-champagne/60 bg-white/70 p-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await subscribeNewsletter({ email });
          if (res.ok) {
            toast.success(res.message);
            setEmail("");
          } else toast.error(res.error);
        });
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input id="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="h-10 flex-1 bg-transparent px-4 text-sm focus:outline-none" />
      <button disabled={pending} className="h-10 rounded-full bg-cocoa px-5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition hover:bg-cocoa-soft disabled:opacity-60 cursor-pointer">
        {pending ? "…" : "Join"}
      </button>
    </form>
  );
}

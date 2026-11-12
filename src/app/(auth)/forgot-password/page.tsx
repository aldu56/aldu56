"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <h1 className="text-5xl">Reset password</h1>
      <p className="mt-2 text-sm text-cocoa-soft">We&apos;ll email you a secure link.</p>
      <form
        className="mt-10 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await requestPasswordReset({ email });
            setMsg(res.ok ? { ok: true, text: res.message! } : { ok: false, text: res.error });
          });
        }}
      >
        {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{msg.text}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pending}>Send reset link</Button>
        <p className="text-center text-sm"><Link href="/login" className="text-rosegold-dark hover:underline">Back to sign in</Link></p>
      </form>
    </>
  );
}

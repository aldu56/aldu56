"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <h1 className="text-5xl">New password</h1>
      <p className="mt-2 text-sm text-cocoa-soft">Choose a new password for your account.</p>
      <form
        className="mt-10 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await updatePassword({ password, confirmPassword });
            if (!res.ok) return setError(res.error);
            toast.success("Password updated");
            router.push("/dashboard");
          });
        }}
      >
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" required value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pending}>Update password</Button>
      </form>
    </>
  );
}

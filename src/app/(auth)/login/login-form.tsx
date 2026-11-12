"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { signIn } from "@/app/actions/auth";

export function LoginForm() {
  const params = useSearchParams();
  const [error, setError] = useState(params.get("error") === "link" ? "That link is invalid or has expired." : "");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      noValidate
      className="mt-10 space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        const res = await signIn(values, params.get("next") ?? undefined);
        if (res && !res.ok) setError(res.error);
      })}
    >
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-rosegold-dark hover:underline">Forgot?</Link>
        </div>
        <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign in</Button>
      <p className="text-center text-sm text-cocoa-soft">New to ÉLORIA? <Link href="/signup" className="text-rosegold-dark hover:underline">Create an account</Link></p>
    </form>
  );
}

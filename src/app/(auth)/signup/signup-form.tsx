"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validation";
import { signUp } from "@/app/actions/auth";

export function SignupForm() {
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: false },
  });

  if (confirmEmail)
    return (
      <div className="mt-10 rounded-3xl bg-white p-8 text-center shadow-soft">
        <MailCheck className="mx-auto size-10 text-rosegold" />
        <p className="mt-4 font-serif text-2xl">Check your inbox</p>
        <p className="mt-2 text-sm text-cocoa-soft">We sent a confirmation link to <strong>{confirmEmail}</strong>. Open it to activate your account.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="mt-10 space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        const res = await signUp(values);
        if (res && !res.ok) setError(res.error);
        else if (res?.ok && res.data?.needsConfirmation) setConfirmEmail(values.email);
      })}
    >
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <label className="flex items-start gap-3 text-sm text-cocoa-soft">
        <input type="checkbox" className="mt-1 accent-[#B99A83]" {...register("acceptTerms")} />
        <span>I accept the <Link href="/terms" className="text-rosegold-dark underline">terms</Link> and <Link href="/privacy" className="text-rosegold-dark underline">privacy policy</Link>.</span>
      </label>
      <FieldError message={errors.acceptTerms?.message} />
      <Button type="submit" size="lg" variant="gold" className="w-full" loading={isSubmitting}>Create account</Button>
      <p className="text-center text-sm text-cocoa-soft">Already a member? <Link href="/login" className="text-rosegold-dark hover:underline">Sign in</Link></p>
    </form>
  );
}

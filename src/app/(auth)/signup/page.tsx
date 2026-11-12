import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-5xl">Create your account</h1>
      <p className="mt-2 text-sm text-cocoa-soft">Then pair your Smart Mirror, Smart Comb, or both.</p>
      <SignupForm />
    </>
  );
}

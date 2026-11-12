import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-5xl">Welcome back</h1>
      <p className="mt-2 text-sm text-cocoa-soft">Sign in to your ÉLORIA account.</p>
      <Suspense><LoginForm /></Suspense>
    </>
  );
}

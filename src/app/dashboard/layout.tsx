import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/app/sidebar";
import { getOwnership, getProfile, requireUser } from "@/lib/data";

export const metadata: Metadata = { title: { default: "My ÉLORIA", template: "%s · My ÉLORIA" }, robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [profile, { hasMirror, hasComb }] = await Promise.all([getProfile(), getOwnership()]);
  const name = profile?.full_name || user.email?.split("@")[0] || "Beauty";
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <DashboardSidebar name={name} hasMirror={hasMirror} hasComb={hasComb} />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

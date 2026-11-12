import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = isSupabaseConfigured ? await getSessionUser() : null;
  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

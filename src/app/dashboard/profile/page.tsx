import { PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/app/profile-form";
import { getProfile, requireUser } from "@/lib/data";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile();
  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" description="Help ÉLORIA tailor your recommendations." />
      <ProfileForm
        email={user.email ?? ""}
        defaults={{
          fullName: profile?.full_name ?? "",
          skinType: (profile?.skin_type as never) ?? "",
          hairType: (profile?.hair_type as never) ?? "",
          birthYear: profile?.birth_year ? String(profile.birth_year) : "",
          concerns: (profile?.concerns as never) ?? [],
          marketingOptIn: profile?.marketing_opt_in ?? false,
        }}
      />
    </>
  );
}

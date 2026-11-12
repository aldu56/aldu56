"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { CONCERNS, HAIR_TYPES, SKIN_TYPES, profileSchema, type ProfileInput } from "@/lib/validation";
import { updateProfile } from "@/app/actions/account";
import { cn } from "@/lib/utils";

export function ProfileForm({ email, defaults }: { email: string; defaults: ProfileInput }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const concerns = watch("concerns");
  return (
    <form
      noValidate
      className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"
      onSubmit={handleSubmit(async (values) => {
        const res = await updateProfile(values);
        if (res.ok) toast.success(res.message);
        else toast.error(res.error);
      })}
    >
      <div className="space-y-6 rounded-3xl bg-white p-8 shadow-soft">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" aria-invalid={!!errors.fullName} {...register("fullName")} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="skinType">Skin type</Label>
            <NativeSelect id="skinType" {...register("skinType")}>
              <option value="">Not sure</option>
              {SKIN_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hairType">Hair type</Label>
            <NativeSelect id="hairType" {...register("hairType")}>
              <option value="">Not sure</option>
              {HAIR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth year</Label>
            <Input id="birthYear" inputMode="numeric" placeholder="1990" aria-invalid={!!errors.birthYear} {...register("birthYear")} />
            <FieldError message={errors.birthYear?.message} />
          </div>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-xs font-medium uppercase tracking-[0.18em] text-cocoa-soft">Beauty concerns</legend>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((c) => {
              const on = concerns.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setValue("concerns", on ? concerns.filter((x) => x !== c) : [...concerns, c], { shouldDirty: true })}
                  className={cn("rounded-full border px-4 py-2 text-sm transition cursor-pointer", on ? "border-rosegold bg-champagne/30 text-cocoa" : "border-champagne text-cocoa-soft hover:border-rosegold")}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 text-sm text-cocoa-soft">
          <input type="checkbox" className="accent-[#B99A83]" {...register("marketingOptIn")} />
          Send me rituals, launches and private events by email.
        </label>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save profile</Button>
      </div>
      <aside className="h-fit rounded-3xl bg-ivory p-8">
        <p className="font-serif text-2xl">Your data, your choice</p>
        <p className="mt-3 text-sm leading-relaxed text-cocoa-soft">Profile details help personalize copy and future recommendations. Delete any analysis from its report page, or contact concierge to export or erase your account.</p>
      </aside>
    </form>
  );
}

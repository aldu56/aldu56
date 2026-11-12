"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { sendContactMessage } from "@/app/actions/commerce";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "general" },
  });

  if (sent)
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <CheckCircle2 className="size-12 text-rosegold" />
        <h2 className="mt-6 text-3xl">Message received</h2>
        <p className="mt-2 text-sm text-cocoa-soft">Our concierge will reply within one business day.</p>
        <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>Send another message</Button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        const res = await sendContactMessage(values);
        if (res.ok) {
          reset();
          setSent(true);
        } else toast.error(res.error);
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <NativeSelect id="topic" {...register("topic")}>
          <option value="general">General enquiry</option>
          <option value="mirror">Smart Mirror support</option>
          <option value="comb">Smart Comb support</option>
          <option value="order">An order</option>
          <option value="press">Press & partnerships</option>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={6} aria-invalid={!!errors.message} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">Send message</Button>
    </form>
  );
}

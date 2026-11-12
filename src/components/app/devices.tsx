"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { pairDevice, renameDevice, unpairDevice } from "@/app/actions/devices";
import { deviceTypeFromSerial, normalizeSerial, pairDeviceSchema } from "@/lib/validation";
import type { Device } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PairValues = z.input<typeof pairDeviceSchema>;

export function PairDeviceForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<PairValues>({ resolver: zodResolver(pairDeviceSchema) });
  const serial = watch("serial") ?? "";
  const detected = deviceTypeFromSerial(normalizeSerial(serial));
  return (
    <form
      noValidate
      className="mt-6 space-y-5"
      onSubmit={handleSubmit(async (values) => {
        const res = await pairDevice({ serial: values.serial, nickname: values.nickname });
        if (!res.ok) return void toast.error(res.error);
        toast.success(`${res.data!.device_type === "mirror" ? "Smart Mirror" : "Smart Comb"} paired`);
        reset({ serial: "", nickname: "" });
        router.refresh();
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="serial">Serial number</Label>
        <Input id="serial" placeholder="ELM-XXXX-XXXX" autoComplete="off" autoCapitalize="characters" spellCheck={false} className="font-mono uppercase tracking-wider" aria-invalid={!!errors.serial} {...register("serial")} />
        {detected && <p className="text-xs text-emerald-700">Detected: ÉLORIA {detected === "mirror" ? "Smart Mirror" : "Smart Comb"}</p>}
        <FieldError message={errors.serial?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname (optional)</Label>
        <Input id="nickname" placeholder="Bathroom mirror" maxLength={40} {...register("nickname")} />
      </div>
      <Button type="submit" className="w-full" loading={isSubmitting}>Pair device</Button>
    </form>
  );
}

export function DeviceCard({ device, image }: { device: Device; image: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(device.nickname);
  const [pending, start] = useTransition();
  const kind = device.device_type === "mirror" ? "skin" : "scalp";

  return (
    <article className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-soft sm:flex-row">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-ivory sm:w-36">
        <Image src={image} alt="" fill className="object-cover" sizes="144px" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">{device.device_type === "mirror" ? "Smart Mirror" : "Smart Comb"}</Badge>
          <Badge variant="success">Paired</Badge>
        </div>
        {editing ? (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await renameDevice({ id: device.id, nickname: name });
                if (!res.ok) return void toast.error(res.error);
                setEditing(false);
                router.refresh();
              });
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label="Device nickname" autoFocus />
            <Button type="submit" size="icon" loading={pending} aria-label="Save name">{!pending && <Check />}</Button>
          </form>
        ) : (
          <h3 className="mt-3 flex items-center gap-2 font-serif text-2xl">
            {device.nickname}
            <button onClick={() => setEditing(true)} className="text-cocoa-soft hover:text-cocoa cursor-pointer" aria-label="Rename device"><Pencil className="size-4" /></button>
          </h3>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-cocoa-soft sm:grid-cols-3">
          <div><dt>Serial</dt><dd className="font-mono text-cocoa">{device.serial}</dd></div>
          <div><dt>Paired</dt><dd className="text-cocoa">{formatDate(device.paired_at)}</dd></div>
          <div><dt>Last used</dt><dd className="text-cocoa">{device.last_used_at ? formatDate(device.last_used_at) : "—"}</dd></div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          <Button asChild size="sm" variant="gold"><Link href={`/dashboard/${kind}/scan`}>New {kind} scan</Link></Button>
          <Dialog>
            <DialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 /> Remove</Button></DialogTrigger>
            <DialogContent>
              <DialogTitle>Remove this device?</DialogTitle>
              <DialogDescription>The device is released so it can be paired to another account — ideal when selling or gifting it. Your past analyses stay in your history.</DialogDescription>
              <div className="mt-8 flex justify-end gap-3">
                <DialogClose asChild><Button variant="outline">Keep</Button></DialogClose>
                <Button
                  variant="destructive"
                  loading={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await unpairDevice(device.id);
                      if (!res.ok) return void toast.error(res.error);
                      toast.success("Device removed");
                      router.refresh();
                    })
                  }
                >
                  Remove device
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </article>
  );
}

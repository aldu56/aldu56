"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteAnalysis } from "@/app/actions/account";
import type { AnalysisKind } from "@/lib/types";

export function DeleteAnalysisButton({ kind, id }: { kind: AnalysisKind; id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label="Delete analysis"><Trash2 /> Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete this analysis?</DialogTitle>
        <DialogDescription>The image, metrics and recommendations will be permanently removed.</DialogDescription>
        <div className="mt-8 flex justify-end gap-3">
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button
            variant="destructive"
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await deleteAnalysis(kind, id);
                if (!res.ok) return void toast.error(res.error);
                toast.success("Analysis deleted");
                router.push(`/dashboard/${kind}`);
              })
            }
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

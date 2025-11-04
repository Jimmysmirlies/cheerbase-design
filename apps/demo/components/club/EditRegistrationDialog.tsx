"use client";
/**
 * EditRegistrationDialog
 *
 * Purpose
 * - Demo editing for a registration: adjust athlete count and preview invoice total.
 */
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import type { Registration } from "@/types/club";

const FEE_PER_ATHLETE = 20; // demo only

export default function EditRegistrationDialog({ trigger, reg }: { trigger: React.ReactNode; reg: Registration }) {
  const [open, setOpen] = useState(false);
  const [athletes, setAthletes] = useState(reg.athletes);

  const total = useMemo(() => `$${athletes * FEE_PER_ATHLETE}`, [athletes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Edit registration</DialogTitle>
          <DialogDescription>Adjust counts before the deadline; totals update automatically.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Athletes</label>
            <Input type="number" value={athletes} onChange={(e) => setAthletes(Number(e.target.value))} />
          </div>
          <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
            <p>
              Invoice total: <span className="font-semibold">{total}</span>
              <span className="text-muted-foreground"> (demo rate ${FEE_PER_ATHLETE}/athlete)</span>
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => setOpen(false)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client";
/**
 * AddMemberDialog
 *
 * Purpose
 * - Collect a new member's basic info and pass it back to the parent.
 */
import { useId, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import type { Person } from "@/types/club";

export default function AddMemberDialog({ roleLabel, onAdd }: { roleLabel: string; onAdd: (p: Person) => void }) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const idPrefix = useId();

  const emailValid = !email || /.+@.+\..+/.test(email);
  const phoneValid = !phone || /^[+\d][\d\s().-]{5,}$/.test(phone);
  const canSubmit = first.trim().length > 0 && last.trim().length > 0 && emailValid && phoneValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button">Add {roleLabel}</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Add {roleLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor={`${idPrefix}-first`} className="text-xs uppercase tracking-wide text-muted-foreground">First Name</Label>
            <Input id={`${idPrefix}-first`} value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${idPrefix}-last`} className="text-xs uppercase tracking-wide text-muted-foreground">Last Name</Label>
            <Input id={`${idPrefix}-last`} value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${idPrefix}-dob`} className="text-xs uppercase tracking-wide text-muted-foreground">Date of Birth</Label>
            <Input id={`${idPrefix}-dob`} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${idPrefix}-email`} className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
            <Input id={`${idPrefix}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {!emailValid ? <span className="text-xs text-destructive">Enter a valid email.</span> : null}
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${idPrefix}-phone`} className="text-xs uppercase tracking-wide text-muted-foreground">Phone</Label>
            <Input id={`${idPrefix}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {!phoneValid ? <span className="text-xs text-destructive">Enter a valid phone.</span> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (!first || !last) return;
                onAdd({ id: `${idPrefix}-${Date.now()}`, firstName: first, lastName: last, dob, email, phone });
                setOpen(false);
                setFirst("");
                setLast("");
                setDob("");
                setEmail("");
                setPhone("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

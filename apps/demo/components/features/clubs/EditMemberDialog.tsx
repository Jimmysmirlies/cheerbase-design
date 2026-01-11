"use client";
/**
 * EditMemberDialog
 *
 * Purpose
 * - Modal editor for an existing team member with Save and Remove actions.
 * - Validates email/phone and asks for confirmation before removal.
 */
import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/shadcn/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/shadcn/alert-dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import type { Person } from "@/types/club";

type Props = {
  person: Person;
  trigger: React.ReactNode;
  onSave: (p: Person) => void;
  onRemove: (id: string) => void;
};

export default function EditMemberDialog({
  person,
  trigger,
  onSave,
  onRemove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState(person.firstName ?? "");
  const [last, setLast] = useState(person.lastName ?? "");
  const [dob, setDob] = useState(person.dob ?? "");
  const [email, setEmail] = useState(person.email ?? "");
  const [phone, setPhone] = useState(person.phone ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const idPrefix = useId();

  const emailValid = !email || /.+@.+\..+/.test(email);
  const phoneValid = !phone || /^[+\d][\d\s().-]{5,}$/.test(phone);
  const canSubmit =
    first.trim().length > 0 &&
    last.trim().length > 0 &&
    emailValid &&
    phoneValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label
              htmlFor={`${idPrefix}-first`}
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              First Name
            </Label>
            <Input
              id={`${idPrefix}-first`}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label
              htmlFor={`${idPrefix}-last`}
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Last Name
            </Label>
            <Input
              id={`${idPrefix}-last`}
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label
              htmlFor={`${idPrefix}-dob`}
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Date of Birth
            </Label>
            <Input
              id={`${idPrefix}-dob`}
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label
              htmlFor={`${idPrefix}-email`}
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!emailValid ? (
              <span className="text-xs text-destructive">
                Enter a valid email.
              </span>
            ) : null}
          </div>
          <div className="grid gap-1">
            <Label
              htmlFor={`${idPrefix}-phone`}
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Phone
            </Label>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {!phoneValid ? (
              <span className="text-xs text-destructive">
                Enter a valid phone.
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-100 text-red-600 hover:bg-red-100/80"
                >
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The member will be removed
                    from this team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onRemove(person.id);
                      setConfirmOpen(false);
                      setOpen(false);
                    }}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  onSave({
                    ...person,
                    firstName: first,
                    lastName: last,
                    dob,
                    email,
                    phone,
                  });
                  setOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

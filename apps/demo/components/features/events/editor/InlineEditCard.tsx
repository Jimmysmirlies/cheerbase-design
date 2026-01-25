"use client";

import { Button } from "@workspace/ui/shadcn/button";

type InlineEditCardProps = {
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveButtonText?: string;
};

export function InlineEditCard({
  children,
  onSave,
  onCancel,
  isSaving = false,
  saveButtonText = "Save",
}: InlineEditCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      {/* Form content */}
      <div>{children}</div>

      {/* Footer with Cancel/Save */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : saveButtonText}
        </Button>
      </div>
    </div>
  );
}

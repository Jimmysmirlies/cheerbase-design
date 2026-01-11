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

      {/* Footer with Save/Cancel */}
      <div className="mt-6 flex items-center gap-4">
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : saveButtonText}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="text-sm text-foreground underline hover:no-underline disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

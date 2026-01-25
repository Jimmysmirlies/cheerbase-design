import { cn } from "@workspace/ui/lib/utils";

type EmptyStateProps = {
  /** Primary message to display */
  children: React.ReactNode;
  /** Additional className for customization */
  className?: string;
};

/**
 * Simple empty state indicator with muted background.
 * Used throughout the app for consistent empty state messaging.
 */
export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

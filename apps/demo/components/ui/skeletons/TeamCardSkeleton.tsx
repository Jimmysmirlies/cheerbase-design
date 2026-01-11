import { Skeleton } from "@workspace/ui/shadcn/skeleton";
import { cn } from "@workspace/ui/lib/utils";

type TeamCardSkeletonProps = {
  className?: string;
};

/**
 * Skeleton for TeamCard component.
 * Shows a collapsed team card loading state.
 */
export function TeamCardSkeleton({ className }: TeamCardSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-md border border-border/70 bg-card/60",
        className,
      )}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Avatar skeleton */}
        <Skeleton className="size-10 rounded-full" />
        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        </div>
        {/* Chevron button */}
        <Skeleton className="size-9 rounded-md" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";

type OrganizerFollowButtonProps = {
  organizerName: string;
  initialFollowing?: boolean;
};

export function OrganizerFollowButton({
  organizerName,
  initialFollowing = false,
}: OrganizerFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsFollowing(!isFollowing)}
      aria-label={
        isFollowing ? `Unfollow ${organizerName}` : `Follow ${organizerName}`
      }
      className={isFollowing ? "text-red-500 hover:text-red-600" : ""}
    >
      <HeartIcon className={`size-4 ${isFollowing ? "fill-current" : ""}`} />
    </Button>
  );
}

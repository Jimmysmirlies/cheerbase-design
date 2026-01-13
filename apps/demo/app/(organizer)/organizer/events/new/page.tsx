"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { EventEditorProvider } from "@/components/providers/EventEditorProvider";
import { EventEditor } from "@/components/features/events/editor/EventEditor";
import type { Event } from "@/types/events";

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/organizer/events");
    }
  }, [user, status, router]);

  // Build initial event from URL params
  const initialEvent = useMemo((): Partial<Event> => {
    const name = searchParams.get("name") || "";
    const type =
      (searchParams.get("type") as "Championship" | "Friendly Competition") ||
      "Championship";
    const capacity = searchParams.get("capacity")
      ? parseInt(searchParams.get("capacity")!, 10)
      : 0;

    return {
      name,
      type,
      slots: { filled: 0, capacity },
      status: "draft",
      visibility: "public",
    };
  }, [searchParams]);

  if (status === "loading" || !user || user.role !== "organizer") {
    return (
      <section className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <EventEditorProvider mode="create" initialEvent={initialEvent}>
      <EventEditor />
    </EventEditorProvider>
  );
}

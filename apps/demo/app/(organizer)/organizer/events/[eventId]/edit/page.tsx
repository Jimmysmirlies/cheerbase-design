"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { EventEditorProvider } from "@/components/providers/EventEditorProvider";
import { EventEditorV2 } from "@/components/features/events/editor/EventEditorV2";
import { findEventById } from "@/data/events";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user, status } = useAuth();

  const eventId =
    typeof params?.eventId === "string"
      ? decodeURIComponent(params.eventId)
      : null;

  const event = useMemo(() => {
    if (!eventId) return null;
    // Get base/published event - let the provider handle draft merging
    return findEventById(eventId);
  }, [eventId]);

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/organizer/events");
      return;
    }
    if (!eventId) {
      router.replace("/organizer/events");
      return;
    }
  }, [user, status, router, eventId]);

  if (status === "loading" || !user || user.role !== "organizer" || !eventId) {
    return (
      <section className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">Event not found</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <EventEditorProvider mode="edit" eventId={eventId} initialEvent={event}>
      <EventEditorV2 />
    </EventEditorProvider>
  );
}

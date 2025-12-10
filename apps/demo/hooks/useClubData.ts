import { useEffect, useState } from "react";

import type { ClubData } from "@/lib/club-data";

type HookState =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "error"; data: null; error: Error }
  | { status: "success"; data: ClubData; error: null };

const clubDataCache = new Map<string, ClubData>();
const inflightRequests = new Map<string, Promise<ClubData>>();

async function fetchClubData(clubOwnerId: string): Promise<ClubData> {
  const cached = clubDataCache.get(clubOwnerId);
  if (cached) return cached;

  const inflight = inflightRequests.get(clubOwnerId);
  if (inflight) return inflight;

  const query = new URLSearchParams({ clubOwnerId }).toString();
  const request = fetch(`/api/demo/club-data?${query}`).then(async (res) => {
    if (!res.ok) throw new Error(`Failed to load club data (${res.status})`);
    const json = (await res.json()) as ClubData;
    clubDataCache.set(clubOwnerId, json);
    return json;
  });

  inflightRequests.set(clubOwnerId, request);
  void request.finally(() => inflightRequests.delete(clubOwnerId));
  return request;
}

export function useClubData(clubOwnerId?: string) {
  const cached = clubOwnerId ? clubDataCache.get(clubOwnerId) : null;
  const [state, setState] = useState<HookState>(() => {
    if (!clubOwnerId) return { status: "idle", data: null, error: null };
    if (cached) return { status: "success", data: cached, error: null };
    return { status: "loading", data: null, error: null };
  });

  useEffect(() => {
    if (!clubOwnerId) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    const cachedData = clubDataCache.get(clubOwnerId);
    if (cachedData) {
      setState({ status: "success", data: cachedData, error: null });
      return;
    }

    let cancelled = false;
    setState((prev) =>
      prev.status === "success" && prev.data ? prev : { status: "loading", data: null, error: null }
    );

    fetchClubData(clubOwnerId)
      .then((json) => {
        if (!cancelled) setState({ status: "success", data: json, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", data: null, error: err as Error });
      });

    return () => {
      cancelled = true;
    };
  }, [clubOwnerId]);

  return {
    data: state.data,
    loading: state.status === "loading" || state.status === "idle",
    error: state.status === "error" ? state.error : null,
  };
}

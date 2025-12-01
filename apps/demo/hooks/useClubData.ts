import { useEffect, useState } from "react";

import type { ClubData } from "@/lib/club-data";

type HookState =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "error"; data: null; error: Error }
  | { status: "success"; data: ClubData; error: null };

export function useClubData(clubOwnerId?: string) {
  const [state, setState] = useState<HookState>({ status: "idle", data: null, error: null });

  useEffect(() => {
    if (!clubOwnerId) {
      setState({ status: "idle", data: null, error: null });
      return;
    }
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    const query = new URLSearchParams({ clubOwnerId }).toString();
    fetch(`/api/demo/club-data?${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load club data (${res.status})`);
        const json = (await res.json()) as ClubData;
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

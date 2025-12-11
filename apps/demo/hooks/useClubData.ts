import { useCallback, useEffect, useState } from "react";

import type { ClubData } from "@/lib/club-data";
import { getUserTeams, getUserRosters } from "./useUserTeams";

const DEMO_CLUB_OWNER_ID = "club-owner-1";

type HookState =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "error"; data: null; error: Error }
  | { status: "success"; data: ClubData; error: null };

// Shared cache for demo data - used by both useClubData and useUnifiedClubData
const demoDataCache = new Map<string, ClubData>();
const inflightRequests = new Map<string, Promise<ClubData>>();

// Export cache accessors for sharing with useUnifiedClubData
export function getSharedClubDataCache(): ClubData | null {
  return demoDataCache.get(DEMO_CLUB_OWNER_ID) ?? null;
}

export function setSharedClubDataCache(data: ClubData): void {
  demoDataCache.set(DEMO_CLUB_OWNER_ID, data);
}

async function fetchClubData(clubOwnerId: string): Promise<ClubData> {
  // Only use cache for demo account
  if (clubOwnerId === DEMO_CLUB_OWNER_ID) {
    const cached = demoDataCache.get(clubOwnerId);
    if (cached) return cached;
  }

  const inflight = inflightRequests.get(clubOwnerId);
  if (inflight) return inflight;

  const query = new URLSearchParams({ clubOwnerId }).toString();
  const request = fetch(`/api/demo/club-data?${query}`).then(async (res) => {
    if (!res.ok) throw new Error(`Failed to load club data (${res.status})`);
    const json = (await res.json()) as ClubData;
    // Only cache demo data
    if (clubOwnerId === DEMO_CLUB_OWNER_ID) {
      demoDataCache.set(clubOwnerId, json);
    }
    return json;
  });

  inflightRequests.set(clubOwnerId, request);
  void request.finally(() => inflightRequests.delete(clubOwnerId));
  return request;
}

// Merge API data with localStorage data for non-demo users
function mergeWithLocalStorage(apiData: ClubData, clubOwnerId: string): ClubData {
  // Demo users get API data as-is
  if (clubOwnerId === DEMO_CLUB_OWNER_ID) {
    return apiData;
  }

  // Non-demo users: merge localStorage teams/rosters with API data
  const localTeams = getUserTeams(clubOwnerId);
  const localRosters = getUserRosters(clubOwnerId);

  return {
    teams: [...apiData.teams, ...localTeams],
    rosters: [...apiData.rosters, ...localRosters],
    registeredTeams: apiData.registeredTeams,
    registrations: apiData.registrations,
  };
}

export function useClubData(clubOwnerId?: string) {
  const isDemo = clubOwnerId === DEMO_CLUB_OWNER_ID;
  const cached = clubOwnerId && isDemo ? demoDataCache.get(clubOwnerId) : null;
  
  const [state, setState] = useState<HookState>(() => {
    if (!clubOwnerId) return { status: "idle", data: null, error: null };
    if (cached) return { status: "success", data: cached, error: null };
    return { status: "loading", data: null, error: null };
  });

  const loadData = useCallback(async (ownerId: string) => {
    try {
      const apiData = await fetchClubData(ownerId);
      const mergedData = mergeWithLocalStorage(apiData, ownerId);
      return mergedData;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!clubOwnerId) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    // For demo accounts, use cache if available
    if (isDemo) {
      const cachedData = demoDataCache.get(clubOwnerId);
      if (cachedData) {
        setState({ status: "success", data: cachedData, error: null });
        return;
      }
    }

    let cancelled = false;
    setState((prev) =>
      prev.status === "success" && prev.data ? prev : { status: "loading", data: null, error: null }
    );

    loadData(clubOwnerId)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", data: null, error: err as Error });
      });

    return () => {
      cancelled = true;
    };
  }, [clubOwnerId, isDemo, loadData]);

  // Refresh function to reload data (useful after creating/updating teams)
  const refresh = useCallback(() => {
    if (!clubOwnerId) return;
    
    loadData(clubOwnerId)
      .then((data) => {
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        setState({ status: "error", data: null, error: err as Error });
      });
  }, [clubOwnerId, loadData]);

  return {
    data: state.data,
    loading: state.status === "loading" || state.status === "idle",
    error: state.status === "error" ? state.error : null,
    refresh,
  };
}

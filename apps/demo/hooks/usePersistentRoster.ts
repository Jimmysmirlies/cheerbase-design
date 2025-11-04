"use client";
import { useEffect, useState } from "react";
import type { TeamRoster } from "@/types/club";

function mergeRoster(fallback: TeamRoster, stored: TeamRoster): TeamRoster {
  return {
    teamId: stored.teamId ?? fallback.teamId,
    coaches: stored.coaches ?? fallback.coaches,
    athletes: stored.athletes ?? fallback.athletes,
    reservists: stored.reservists ?? fallback.reservists,
    chaperones: stored.chaperones ?? fallback.chaperones,
  };
}

export function usePersistentRoster(teamId: string, fallback: TeamRoster) {
  const storageKey = `demoRoster:${teamId}`;
  const [roster, setRoster] = useState<TeamRoster>(fallback);

  useEffect(() => {
    if (!teamId) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as TeamRoster;
        setRoster(mergeRoster(fallback, parsed));
        return;
      }
    } catch (error) {
      console.warn("Failed to load roster", error);
    }
    setRoster(fallback);
  }, [teamId, storageKey, fallback]);

  useEffect(() => {
    if (!teamId) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(roster));
    } catch (error) {
      console.warn("Failed to persist roster", error);
    }
  }, [teamId, storageKey, roster]);

  return [roster, setRoster] as const;
}


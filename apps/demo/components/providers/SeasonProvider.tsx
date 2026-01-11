"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

export type SeasonOption = {
  id: string;
  label: string;
  start: Date;
  end: Date;
  type: "current" | "past";
};

const seasonOptions: SeasonOption[] = [
  {
    id: "2025-2026",
    label: "Nov 2025 - May 2026",
    start: new Date(2025, 10, 1),
    end: new Date(2026, 4, 30),
    type: "current",
  },
  {
    id: "2024-2025",
    label: "Nov 2024 - May 2025",
    start: new Date(2024, 10, 1),
    end: new Date(2025, 4, 30),
    type: "past",
  },
  {
    id: "2023-2024",
    label: "Nov 2023 - May 2024",
    start: new Date(2023, 10, 1),
    end: new Date(2024, 4, 30),
    type: "past",
  },
];

const ALL_SEASONS_ID = "all";

const defaultSeason =
  seasonOptions.find((season) => season.type === "current") ??
  seasonOptions[0]!;
const defaultSeasonId = defaultSeason.id;

function resolveSeasonById(seasonId: string): SeasonOption | null {
  if (seasonId === ALL_SEASONS_ID) return null;
  return (
    seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
  );
}

type SeasonContextType = {
  selectedSeasonId: string;
  setSelectedSeasonId: (id: string) => void;
  selectedSeason: SeasonOption | null;
  isAllSeasons: boolean;
  seasonOptions: SeasonOption[];
  seasonSelectOptions: Array<
    { value: string; label: string } | { type: "separator" }
  >;
  ALL_SEASONS_ID: string;
};

const SeasonContext = createContext<SeasonContextType | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [selectedSeasonId, setSelectedSeasonId] =
    useState<string>(defaultSeasonId);

  const selectedSeason = resolveSeasonById(selectedSeasonId);
  const isAllSeasons = selectedSeasonId === ALL_SEASONS_ID;

  const seasonSelectOptions = useMemo(() => {
    // All seasons in descending order (newest first)
    const allSeasonsSorted = [...seasonOptions]
      .sort((a, b) => b.start.getTime() - a.start.getTime())
      .map((option) => ({ value: option.id, label: option.label }));

    return [
      { value: ALL_SEASONS_ID, label: "All Seasons" },
      { type: "separator" as const },
      ...allSeasonsSorted,
    ];
  }, []);

  const value = useMemo(
    () => ({
      selectedSeasonId,
      setSelectedSeasonId,
      selectedSeason,
      isAllSeasons,
      seasonOptions,
      seasonSelectOptions,
      ALL_SEASONS_ID,
    }),
    [selectedSeasonId, selectedSeason, isAllSeasons, seasonSelectOptions],
  );

  return (
    <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
}

export function useSeasonSafe() {
  const context = useContext(SeasonContext);
  return context;
}

export { ALL_SEASONS_ID, seasonOptions, defaultSeasonId, resolveSeasonById };

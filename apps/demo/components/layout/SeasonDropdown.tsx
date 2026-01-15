"use client";

import { GlassSelect } from "@workspace/ui/components/glass-select";
import { useSeason } from "@/components/providers/SeasonProvider";

export function SeasonDropdown() {
  const { selectedSeasonId, setSelectedSeasonId, seasonSelectOptions } =
    useSeason();

  return (
    <GlassSelect
      value={selectedSeasonId}
      onValueChange={setSelectedSeasonId}
      options={seasonSelectOptions}
      triggerClassName="w-[220px]"
    />
  );
}

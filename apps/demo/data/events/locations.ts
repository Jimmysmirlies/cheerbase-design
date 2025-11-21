import type { Event } from "@/types/events";

import { listEvents } from "./categories";

const LOCATION_LABEL_OVERRIDES: Record<string, string> = {
  QC: "Quebec",
  ON: "Ontario",
  MA: "Massachusetts",
  NY: "New York",
  TX: "Texas",
  IL: "Illinois",
  CA: "California",
  AZ: "Arizona",
};

const IGNORED_PARTS = new Set(["Canada", "USA", "United States", "United States of America"]);

export type ProvinceOption = {
  code: string;
  label: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getProvinceFromLocation(location: string): ProvinceOption | null {
  if (!location) {
    return null;
  }
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !IGNORED_PARTS.has(part));

  if (!parts.length) {
    return null;
  }

  const codeCandidate = [...parts].reverse().find((part) => /^[A-Z]{2}$/.test(part));
  if (codeCandidate) {
    return {
      code: codeCandidate,
      label: LOCATION_LABEL_OVERRIDES[codeCandidate] ?? codeCandidate,
    };
  }

  const fallback = parts.at(-1);
  if (!fallback) {
    return null;
  }

  return {
    code: slugify(fallback),
    label: fallback,
  };
}

export function getProvinceOptions(events: Event[] = listEvents()): ProvinceOption[] {
  const options = new Map<string, ProvinceOption>();
  events.forEach((event) => {
    const province = getProvinceFromLocation(event.location);
    if (!province) {
      return;
    }
    if (!options.has(province.code)) {
      options.set(province.code, province);
    }
  });
  return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label));
}

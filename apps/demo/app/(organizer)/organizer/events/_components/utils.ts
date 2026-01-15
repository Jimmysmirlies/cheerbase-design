import type { SeasonOption } from "@/components/providers/SeasonProvider";
import type { EventRow, MonthSection } from "./types";

/**
 * Build month sections from a season date range
 */
export function buildMonthSections(
  rows: EventRow[],
  season: SeasonOption,
): MonthSection[] {
  const start = new Date(
    season.start.getFullYear(),
    season.start.getMonth(),
    1,
  );
  const end = new Date(season.end.getFullYear(), season.end.getMonth(), 1);

  const months: MonthSection[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    const label = cursor.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const items = rows.filter((row) => {
      const d = row.eventDate;
      return (
        d.getFullYear() === cursor.getFullYear() &&
        d.getMonth() === cursor.getMonth()
      );
    });
    months.push({ key, label, items });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

/**
 * Build month sections from event rows (for "All Seasons" view)
 */
export function buildMonthSectionsFromRows(rows: EventRow[]): MonthSection[] {
  const monthMap = new Map<string, EventRow[]>();

  rows.forEach((row) => {
    const d = row.eventDate;
    if (Number.isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = monthMap.get(key) ?? [];
    existing.push(row);
    monthMap.set(key, existing);
  });

  const months: MonthSection[] = Array.from(monthMap.entries())
    .map(([key, items]) => {
      const [year = 0, month = 0] = key
        .split("-")
        .map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0));
      const date = new Date(year, month, 1);
      const label = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { key, label, items };
    })
    .sort((a, b) => {
      const [yearA = 0, monthA = 0] = a.key
        .split("-")
        .map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0));
      const [yearB = 0, monthB = 0] = b.key
        .split("-")
        .map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0));
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

  return months;
}

/**
 * Format Date to ISO string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

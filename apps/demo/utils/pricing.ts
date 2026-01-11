import type { DivisionPricing } from "@/types/events";

export type ActiveDivisionRate = {
  price: number;
  tier: "earlyBird" | "regular";
};

export function resolveDivisionPricing(
  pricing: DivisionPricing,
  referenceDate: Date = new Date(),
): ActiveDivisionRate {
  if (pricing.earlyBird && pricing.earlyBird.deadline) {
    const deadline = parseIsoDateToLocal(pricing.earlyBird.deadline);
    if (referenceDate <= deadline) {
      return { price: pricing.earlyBird.price, tier: "earlyBird" };
    }
  }

  return { price: pricing.regular.price, tier: "regular" };
}

function parseIsoDateToLocal(value: string): Date {
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return new Date(value);
  }

  const safeMonth = Math.max(1, Math.min(12, month || 1));
  const safeDay = Math.max(1, Math.min(31, day || 1));

  return new Date(year, safeMonth - 1, safeDay, 23, 59, 59, 999);
}

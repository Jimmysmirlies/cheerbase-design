export function formatFriendlyDate(value?: string | Date): string {
  if (!value) return "—";
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return typeof value === "string" ? value : value.toISOString();
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPhoneNumber(value?: string) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    const [, area, prefix, line] = digits.match(/(\d{3})(\d{3})(\d{4})/)!;
    return `(${area}) ${prefix}-${line}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const [, area, prefix, line] = digits.match(/1(\d{3})(\d{3})(\d{4})/)!;
    return `+1 (${area}) ${prefix}-${line}`;
  }

  return value;
}

export function formatCurrency(value: number, currency: string = "USD") {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
}

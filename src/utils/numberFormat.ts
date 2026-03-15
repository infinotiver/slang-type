export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function roundTo(
  value: number | string | null | undefined,
  digits = 0,
): number {
  const n = toNumber(value);
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export function formatFixed(
  value: number | string | null | undefined,
  digits = 1,
): string {
  return roundTo(value, digits).toFixed(digits);
}

export function formatPercent(
  value: number | string | null | undefined,
  digits = 0,
): string {
  return `${formatFixed(value, digits)}%`;
}

/** Matches medical_services_price_bounds. Safe for JavaScript integers. */
export const PRICE_MAX = 1_000_000_000_000;

export function priceToNumber(value: bigint | number | null): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "bigint") {
    if (value < BigInt(0) || value > BigInt(PRICE_MAX)) {
      throw new Error("price out of range");
    }
    return Number(value);
  }
  if (!Number.isSafeInteger(value) || value < 0 || value > PRICE_MAX) {
    throw new Error("price out of range");
  }
  return value;
}

export function displayPrices(row: {
  priceMin: bigint | number | null;
  priceMax: bigint | number | null;
}): { priceMin: number | null; priceMax: number | null } {
  return {
    priceMin: priceToNumber(row.priceMin),
    priceMax: priceToNumber(row.priceMax),
  };
}

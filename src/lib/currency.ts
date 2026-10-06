export const COUNTRY_CURRENCY: Record<string, string> = {
  ZA: "ZAR",
  AO: "AOA",
  MZ: "MZN",
  CN: "CNY",
  US: "USD",
  FR: "EUR",
  GB: "GBP",
};

export function currencyForCountry(country?: string | null): string {
  return COUNTRY_CURRENCY[String(country ?? "").toUpperCase()] ?? "ZAR";
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "ZAR",
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ZAR" || currency === "AOA" ? 2 : 2,
  }).format(amount);
}

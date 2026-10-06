export const COUNTRY_CURRENCY: Record<string, string> = {
  ZA: "ZAR", AO: "AOA", MZ: "MZN", CN: "CNY",
  BR: "BRL", FR: "EUR", PT: "EUR", DE: "EUR", ES: "EUR", IT: "EUR",
  GB: "GBP", US: "USD", CA: "CAD", AU: "AUD", NZ: "NZD",
  IN: "INR", JP: "JPY", KR: "KRW", NG: "NGN", KE: "KES",
  GH: "GHS", TZ: "TZS", UG: "UGX", ZM: "ZMW", BW: "BWP",
  NA: "NAD", SZ: "SZL", MW: "MWK", RW: "RWF", CD: "CDF",
  AE: "AED", SA: "SAR", QA: "QAR", CH: "CHF", SE: "SEK",
  NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY", MX: "MXN",
};

export function currencyForCountry(country?: string | null): string {
  return COUNTRY_CURRENCY[String(country ?? "").toUpperCase()] ?? "USD";
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "ZAR",
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

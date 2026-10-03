export function formatCurrency(
  value: number | string | null | undefined,
  currency = "ZAR"
): string {
  const amount = Number(value ?? 0);

  if (currency === "ZAR") {
    return `R${Math.round(amount).toLocaleString("en-ZA")}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

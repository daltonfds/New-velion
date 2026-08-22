export async function getExchangeRates() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/ZAR", { next: { revalidate: 3600 } });
    if (!res.ok) return { ZAR: 1, USD: 0.055 };
    const data = await res.json();
    return data.rates;
  } catch (error) {
    return { ZAR: 1, USD: 0.055 };
  }
}

export function formatCurrency(amount: number, currency: string, locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

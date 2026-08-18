// Mapeamento de código de país para código de moeda ISO
export const countryCurrencyMap: Record<string, string> = {
  "MZ": "MZN", // Moçambique
  "AO": "AOA", // Angola
  "ZA": "ZAR", // África do Sul (já é a base)
  "US": "USD",
  "GB": "GBP",
  "PT": "EUR",
  "CN": "CNY",
  "JP": "JPY",
  "NG": "NGN",
};

export function getCurrencyCode(countryCode: string): string {
  return countryCurrencyMap[countryCode] || "ZAR";
}

export async function getExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("/api/exchange-rates");
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates || null;
  } catch {
    return null;
  }
}

// Formata um valor com a moeda especificada
export function formatCurrency(amount: number, currency: string, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Função principal: Retorna os valores formatados nas três moedas
export async function formatMultiCurrency(
  amountZAR: number,
  countryCode: string,
  locale = "en"
): Promise<{
  zar: string;
  usd: string;
  local: string;
  localCurrency: string;
}> {
  const rates = await getExchangeRates();

  // Sempre formata em ZAR (moeda base)
  const zar = formatCurrency(amountZAR, "ZAR", locale);

  // Se não temos taxas, retornamos apenas ZAR e placeholders
  if (!rates) {
    return {
      zar,
      usd: "USD N/A",
      local: "N/A",
      localCurrency: "N/A",
    };
  }

  // Moeda internacional (USD)
  const usdRate = rates["USD"];
  const usd = usdRate 
    ? formatCurrency(amountZAR * usdRate, "USD", locale)
    : "USD N/A";

  // Moeda local (baseada no país do utilizador)
  const localCurrency = getCurrencyCode(countryCode);
  // Se a moeda local for ZAR, não fazemos conversão dupla
  if (localCurrency === "ZAR") {
    return { zar, usd, local: zar, localCurrency };
  }

  const localRate = rates[localCurrency];
  const local = localRate
    ? formatCurrency(amountZAR * localRate, localCurrency, locale)
    : `${localCurrency} N/A`;

  return { zar, usd, local, localCurrency };
}

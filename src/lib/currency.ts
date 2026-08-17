export const countryCurrencyMap: Record<string, string> = {
  "MZ": "MZN", "AO": "AOA", "ZA": "ZAR", "NG": "NGN", "KE": "KES", 
  "TZ": "TZS", "ZM": "ZMW", "ZW": "ZWL", "EG": "EGP", "MA": "MAD", 
  "TN": "TND", "DZ": "DZD", "US": "USD", "CA": "CAD", "BR": "BRL", 
  "MX": "MXN", "AR": "ARS", "GB": "GBP", "FR": "EUR", "DE": "EUR", 
  "IT": "EUR", "ES": "EUR", "PT": "EUR", "RU": "RUB", "CN": "CNY", 
  "JP": "JPY", "IN": "INR", "KR": "KRW", "SG": "SGD", "AU": "AUD", 
  "NZ": "NZD"
};

export function getCurrencyCode(countryCode: string): string {
  return countryCurrencyMap[countryCode] || "ZAR";
}

export async function getExchangeRates(): Promise<Record<string, number> | null> {
  const res = await fetch("/api/exchange-rates");
  if (!res.ok) return null;
  const data = await res.json();
  return data.rates || null;
}

// Formata um valor em ZAR para a moeda local
export async function formatCurrency(amountZAR: number, countryCode: string, locale = "en"): Promise<string> {
  const rates = await getExchangeRates();
  const targetCurrency = getCurrencyCode(countryCode);
  
  // Se não tiver câmbio (erro na API), exibe apenas ZAR
  if (!rates) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amountZAR);
  }

  if (targetCurrency === "ZAR") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amountZAR);
  }

  const rate = rates[targetCurrency];
  if (!rate) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amountZAR);
  }

  const converted = amountZAR * rate;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: 2,
  }).format(converted);
}

// Função que retorna um objeto com ambos os valores (ZAR + Local)
export async function formatDualCurrency(
  amountZAR: number,
  countryCode: string,
  locale = "en"
): Promise<{ zar: string; local: string }> {
  const zarFormatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amountZAR);

  // Se o país for África do Sul, nem tenta converter
  if (countryCode === "ZA") {
    return { zar: zarFormatted, local: zarFormatted };
  }

  // Tenta formatar a moeda local
  try {
    const local = await formatCurrency(amountZAR, countryCode, locale);
    return { zar: zarFormatted, local };
  } catch {
    // Se a conversão falhar (câmbio indisponível), mostra apenas ZAR
    return { zar: zarFormatted, local: zarFormatted };
  }
}

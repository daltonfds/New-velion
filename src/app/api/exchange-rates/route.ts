import { NextResponse } from "next/server";

// Cache simples em memória para evitar sobrecarga da API externa
let cachedRates: Record<string, number> | null = null;
let lastFetch: number | null = null;
const CACHE_DURATION = 3600000; // 1 hora

export async function GET() {
  const now = Date.now();

  // Se temos cache válido, devolvemos ele
  if (cachedRates && lastFetch && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ base: "ZAR", rates: cachedRates, source: "cache" });
  }

  try {
    // Tentamos buscar a taxa real da API pública
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/ZAR", {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) throw new Error("API call failed");

    const data = await response.json();
    cachedRates = data.rates;
    lastFetch = now;

    return NextResponse.json({ base: "ZAR", rates: cachedRates, source: "live" });
  } catch (error) {
    // Se a API falhar e tivermos cache antigo, usamos ele
    if (cachedRates) {
      return NextResponse.json({ base: "ZAR", rates: cachedRates, source: "stale-cache" });
    }
    
    // Se nunca tivermos buscado, retornamos erro (o frontend tratará)
    return NextResponse.json({ error: "Unable to fetch rates" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";

// Cache em memória para guardar a ÚLTIMA cotação real buscada
let cachedRates: Record<string, number> | null = null;
let lastFetch: number | null = null;
const CACHE_DURATION = 3600000; // 1 hora em ms

export async function GET() {
  const now = Date.now();

  // 1. Se temos uma cotação real em cache e ela é recente (menos de 1h), devolve ela
  if (cachedRates && lastFetch && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ 
      base: "ZAR", 
      rates: cachedRates,
      source: "cache" 
    });
  }

  try {
    // 2. Tenta buscar cotação real do dia
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/ZAR", {
      next: { revalidate: 3600 } // Cache do Next.js
    });
    
    if (!response.ok) throw new Error("Failed to fetch live rates");

    const data = await response.json();
    
    // Atualiza o cache com os dados REAIS
    cachedRates = data.rates;
    lastFetch = now;

    return NextResponse.json({ 
      base: "ZAR", 
      rates: cachedRates,
      source: "live" 
    });

  } catch (error) {
    // 3. Se a API externa falhou, mas TEMOS um cache antigo (mesmo que velho), usamos ele
    if (cachedRates) {
      return NextResponse.json({ 
        base: "ZAR", 
        rates: cachedRates,
        source: "stale-cache" 
      });
    }

    // 4. Se NUNCA conseguimos buscar (primeira execução), retorna erro. 
    // O frontend vai lidar com isso exibindo apenas ZAR.
    return NextResponse.json({ 
      error: "Unable to fetch exchange rates",
      base: "ZAR" 
    }, { status: 503 });
  }
}

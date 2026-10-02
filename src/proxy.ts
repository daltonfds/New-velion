import { NextRequest, NextResponse } from "next/server";

const ASIA_COUNTRIES = new Set([
  // Central Asia
  "KZ", // Kazakhstan
  "KG", // Kyrgyzstan
  "TJ", // Tajikistan
  "TM", // Turkmenistan
  "UZ", // Uzbekistan

  // East Asia
  "CN", // China
  "HK", // Hong Kong
  "MO", // Macao
  "JP", // Japan
  "KP", // North Korea
  "KR", // South Korea
  "MN", // Mongolia
  "TW", // Taiwan

  // South Asia
  "AF", // Afghanistan
  "BD", // Bangladesh
  "BT", // Bhutan
  "IN", // India
  "MV", // Maldives
  "NP", // Nepal
  "PK", // Pakistan
  "LK", // Sri Lanka

  // Southeast Asia
  "BN", // Brunei
  "KH", // Cambodia
  "ID", // Indonesia
  "LA", // Laos
  "MY", // Malaysia
  "MM", // Myanmar
  "PH", // Philippines
  "SG", // Singapore
  "TH", // Thailand
  "TL", // Timor-Leste
  "VN", // Vietnam

  // Western Asia
  "AM", // Armenia
  "AZ", // Azerbaijan
  "BH", // Bahrain
  "CY", // Cyprus
  "GE", // Georgia
  "IQ", // Iraq
  "IL", // Israel
  "JO", // Jordan
  "KW", // Kuwait
  "LB", // Lebanon
  "OM", // Oman
  "QA", // Qatar
  "SA", // Saudi Arabia
  "PS", // Palestine
  "SY", // Syria
  "TR", // Türkiye
  "AE", // United Arab Emirates
  "YE", // Yemen
]);

export function proxy(request: NextRequest) {
  const country = (
    request.headers.get("x-vercel-ip-country") || ""
  ).toUpperCase();

  if (country && ASIA_COUNTRIES.has(country)) {
    return new NextResponse(
      "Access denied.",
      {
        status: 403,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

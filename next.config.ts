import type { NextConfig } from "next";

const nextConfig: NextConfig = {\n  async headers() {\n    return [{\n      source: "/(.*)",\n      headers: [\n        { key: "X-Content-Type-Options", value: "nosniff" },\n        { key: "X-Frame-Options", value: "DENY" },\n        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },\n        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },\n        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },\n      ],\n    }];\n  },
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ndtitpmkfbouvaiforfx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

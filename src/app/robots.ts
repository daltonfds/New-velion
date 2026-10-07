import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/account/", "/checkout/", "/cart/"] }],
    sitemap: "https://veliongroup.online/sitemap.xml",
    host: "https://veliongroup.online",
  };
}

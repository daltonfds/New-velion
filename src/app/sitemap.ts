import type { MetadataRoute } from "next";

const baseUrl = "https://veliongroup.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/register", "/register/customer", "/login", "/terms", "/privacy", "/cookies", "/refund-policy", "/seller-terms", "/acceptable-use", "/support", "/docs/integrations"];
  return paths.map((path) => ({ url: baseUrl + path, changeFrequency: "weekly", priority: path === "/" ? 1 : 0.6 }));
}

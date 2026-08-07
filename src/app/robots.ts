import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://wallpaperhub.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/login",
        "/register",
        "/studio",
        "/notifications",
        "/favorites",
        "/downloads",
        "/profile",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

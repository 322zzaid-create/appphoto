import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://wallpaperhub.app";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${base}/`, changeFrequency: "daily", priority: 1 },
  { url: `${base}/browse`, changeFrequency: "daily", priority: 0.9 },
  { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/search`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [...staticRoutes];

  try {
    const admin = createAdminClient();
    const { data: wallpapers } = await admin
      .from("wallpapers")
      .select("id, updated_at")
      .eq("status", "published")
      .eq("visibility", "public");

    for (const wallpaper of wallpapers ?? []) {
      routes.push({
        url: `${base}/wallpaper/${wallpaper.id}`,
        lastModified: wallpaper.updated_at
          ? new Date(wallpaper.updated_at)
          : undefined,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // No database access during build → static routes only.
  }

  return routes;
}

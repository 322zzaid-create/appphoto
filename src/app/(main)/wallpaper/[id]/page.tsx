import { createClient } from "@supabase/supabase-js";
import { WallpaperDetailContent } from "./wallpaper-detail-content";

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const { data, error } = await supabase
      .from("wallpapers")
      .select("id")
      .eq("status", "published")
      .eq("visibility", "public")
      .limit(10000);

    if (error) {
      throw new Error(`Failed to fetch wallpaper ids: ${error.message}`);
    }

    return (data ?? []).map((w) => ({ id: w.id }));
  } catch (err) {
    if (process.env.NEXT_EXPORT === "true") {
      throw err;
    }
    return [];
  }
}

export default async function WallpaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <WallpaperDetailContent id={id} />
      </div>
    </div>
  );
}

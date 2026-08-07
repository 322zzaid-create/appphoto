import type { SupabaseClient } from "@supabase/supabase-js";

export const DOWNLOAD_WINDOW_MINUTES = 10;
export const DOWNLOAD_MAX_PER_WINDOW = 5;

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

export async function isDownloadRateLimited(
  adminClient: Pick<SupabaseClient, "from">,
  ip: string | null,
): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - DOWNLOAD_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await adminClient
    .from("downloads")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", since);
  return (count ?? 0) >= DOWNLOAD_MAX_PER_WINDOW;
}

import { signAdToken, verifyAdToken } from "@/lib/security/ad-token";
import { isDownloadRateLimited } from "@/lib/security/rate-limit";

export const AD_CONFIRM_TTL_MS = 10 * 60 * 1000;
export const AD_CONFIRM_MAX_PER_WINDOW = 10;

/**
 * Minimal structural view of the Supabase clients the download flow needs.
 * Kept narrow so the flow is easy to unit-test with fakes.
 */
export interface AdminDbClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
}

export interface AuthDbClient extends AdminDbClient {
  auth: {
    getUser(): Promise<{ data: { user: { id: string } | null } }>;
  };
}

export interface DownloadServiceClients {
  admin: AdminDbClient;
  auth: AuthDbClient;
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

/** Guard against non-INET values reaching the ip_address column. */
function sanitizeIp(ip: string | null): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();
  if (trimmed.length > 45) return null;
  if (!/^[0-9a-fA-F.:]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Records a server-side confirmation that the ad was watched. Idempotent per
 * nonce, rate-limited per IP. Consumed (once) by requestDownloadToken.
 */
export async function confirmAdWatch(
  { admin }: Pick<DownloadServiceClients, "admin">,
  {
    wallpaperId,
    nonce,
    ip,
  }: { wallpaperId: string; nonce: string; ip: string | null },
): Promise<ServiceResult<{ id: string }>> {
  if (typeof nonce !== "string" || !nonce || nonce.length > 200) {
    return { ok: false, error: "Invalid request", status: 400 };
  }

  const existing = await admin
    .from("ad_confirmations")
    .select("id")
    .eq("nonce", nonce)
    .maybeSingle();
  if (existing.data) {
    return { ok: true, data: { id: existing.data.id as string } };
  }

  if (ip) {
    const since = new Date(Date.now() - AD_CONFIRM_TTL_MS).toISOString();
    const { count } = await admin
      .from("ad_confirmations")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= AD_CONFIRM_MAX_PER_WINDOW) {
      return { ok: false, error: "Too many ad confirmations. Try again later.", status: 429 };
    }
  }

  const { data, error } = await admin
    .from("ad_confirmations")
    .insert({ nonce, wallpaper_id: wallpaperId, ip_address: sanitizeIp(ip) })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: "Unable to confirm ad view", status: 500 };
  }
  return { ok: true, data: { id: data.id as string } };
}

/**
 * Issues a short-lived download token, but only when a fresh, unconsumed ad
 * confirmation exists for the same nonce + wallpaper + IP. The confirmation is
 * marked consumed so it cannot be reused.
 */
export async function requestDownloadToken(
  { admin, auth }: DownloadServiceClients,
  {
    wallpaperId,
    nonce,
    ip,
  }: { wallpaperId: string; nonce: string; ip: string | null },
): Promise<ServiceResult<{ token: string }>> {
  if (typeof nonce !== "string" || !nonce) {
    return { ok: false, error: "Missing ad confirmation", status: 400 };
  }

  const { data: wallpaper, error } = await auth
    .from("wallpapers")
    .select("id, is_premium")
    .eq("id", wallpaperId)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();
  if (error || !wallpaper) {
    return { ok: false, error: "Wallpaper not found", status: 404 };
  }

  const since = new Date(Date.now() - AD_CONFIRM_TTL_MS).toISOString();
  let confirmationQuery = admin
    .from("ad_confirmations")
    .select("id")
    .eq("nonce", nonce)
    .eq("wallpaper_id", wallpaperId)
    .is("consumed_at", null)
    .gte("created_at", since);
  if (ip) {
    confirmationQuery = confirmationQuery.eq("ip_address", ip);
  }
  const { data: confirmation } = await confirmationQuery.maybeSingle();
  if (!confirmation) {
    return { ok: false, error: "Ad not confirmed. Please watch the ad first.", status: 403 };
  }

  if (await isDownloadRateLimited(admin, ip)) {
    return { ok: false, error: "Download limit reached. Please try again later.", status: 429 };
  }

  if (wallpaper.is_premium) {
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return {
        ok: false,
        error: "This wallpaper is premium-only. Log in and upgrade to download it.",
        status: 403,
      };
    }
    const { data: profile } = await auth
      .from("profiles")
      .select("is_premium, role")
      .eq("id", user.id)
      .single();
    if (
      !profile ||
      (profile.role !== "admin" && profile.role !== "artist" && !profile.is_premium)
    ) {
      return {
        ok: false,
        error: "This wallpaper is premium-only. Upgrade your account to download it.",
        status: 403,
      };
    }
  }

  await admin
    .from("ad_confirmations")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", confirmation.id);

  return { ok: true, data: { token: signAdToken(wallpaperId) } };
}

/**
 * Validates the ad token, checks rate limit, logs the download and returns the
 * redirect target for the original file.
 */
export async function resolveDownloadUrl(
  { admin, auth }: DownloadServiceClients,
  {
    wallpaperId,
    token,
    ip,
    userAgent,
  }: { wallpaperId: string; token: string; ip: string | null; userAgent: string | null },
): Promise<ServiceResult<{ url: string }>> {
  if (typeof token !== "string" || !verifyAdToken(token, wallpaperId)) {
    return { ok: false, error: "Unauthorized download attempt", status: 403 };
  }

  const { data: wallpaper, error } = await auth
    .from("wallpapers")
    .select("original_url")
    .eq("id", wallpaperId)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();
  if (error || !wallpaper?.original_url) {
    return { ok: false, error: "Wallpaper not found", status: 404 };
  }

  if (await isDownloadRateLimited(admin, ip)) {
    return { ok: false, error: "Download limit reached. Please try again later.", status: 429 };
  }

  const {
    data: { user },
  } = await auth.auth.getUser();

  await admin.from("downloads").insert({
    wallpaper_id: wallpaperId,
    user_id: user?.id || null,
    quality: "original",
    ip_address: sanitizeIp(ip),
    user_agent: userAgent,
    device_type: null,
  });

  return { ok: true, data: { url: wallpaper.original_url } };
}

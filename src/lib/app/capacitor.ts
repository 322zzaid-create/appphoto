"use client";

export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== "undefined";
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "";
}

/**
 * Resolves an API path for the current runtime. In the native app the pages
 * are served from a local WebView (static export), so API routes must target
 * the remote deployment instead of a relative `/api/...` URL. On the web the
 * path is used as-is.
 */
export function apiUrl(path: string): string {
  if (isCapacitor()) {
    const base = getAppUrl();
    if (base) return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path;
}

export function getDeepLinkCallbackUrl(): string {
  return "com.zerotime.wallpaperhub://callback";
}

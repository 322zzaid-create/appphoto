"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isCapacitor } from "@/lib/app/capacitor";

const DEEP_LINK_SCHEME = "com.zerotime.wallpaperhub";

/**
 * Handles the OAuth callback when the app runs inside Capacitor. Google opens
 * in a Custom Tab and redirects back to `com.zerotime.wallpaperhub://callback
 * ?code=...`, which resumes the app and fires appUrlOpen. The code is exchanged
 * for a session client-side (the server /callback route does not exist in the
 * static export).
 */
export function OAuthDeepLinkHandler() {
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!isCapacitor()) return;
    let active = true;

    async function handle(url: string) {
      if (!url.startsWith(`${DEEP_LINK_SCHEME}://`)) return;
      try {
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");
        if (code) {
          const { error } = await supabaseRef.current.auth.exchangeCodeForSession(code);
          if (!error && active) {
            router.replace("/");
          }
        }
      } catch {
        /* ignore malformed urls */
      }
    }

    let unlisten: (() => void) | undefined;
    let disposed = false;

    (async () => {
      const { App } = await import("@capacitor/app");
      if (!active || disposed) return;

      const launchUrl = await App.getLaunchUrl().catch(() => null);
      if (launchUrl?.url) handle(launchUrl.url);

      const listener = await App.addListener("appUrlOpen", (data) => {
        handle(data.url);
      });
      unlisten = listener.remove;
    })();

    return () => {
      active = false;
      disposed = true;
      unlisten?.();
    };
  }, [router]);

  return null;
}

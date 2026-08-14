"use client";

import { useEffect } from "react";
import { installApiRewrite, installAppServiceWorker } from "@/lib/app/api-rewrite";
import { OAuthDeepLinkHandler } from "@/components/auth/oauth-deep-link";

/**
 * Installed once in the root layout. Sets up Capacitor-only runtime helpers
 * (API URL rewriting and the app service worker) and the OAuth deep-link
 * listener. No-ops on the web.
 */
export function AppBootstrap() {
  useEffect(() => {
    installApiRewrite();
    installAppServiceWorker();
  }, []);

  return <OAuthDeepLinkHandler />;
}

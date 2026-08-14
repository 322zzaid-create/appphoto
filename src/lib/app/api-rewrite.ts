"use client";

import { isCapacitor, getAppUrl } from "./capacitor";

let installed = false;

/**
 * In the Capacitor build the app is served from a local origin (https://localhost)
 * so relative "/api/*" calls (download token, ad confirm, download redirect)
 * must be forwarded to the real deployment. The live site is untouched: when
 * the page origin already equals the app URL the rewrite is a no-op.
 */
export function installApiRewrite(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const appUrl = getAppUrl();
  if (!appUrl) return;

  const rewriteUrl = (url: string): string => {
    if (url.startsWith("/") && !url.startsWith("//")) {
      return `${appUrl}${url}`;
    }
    return url;
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteUrl(input), init);
    }
    if (input instanceof Request) {
      const rewritten = new Request(rewriteUrl(input.url), input);
      return originalFetch(rewritten, init);
    }
    return originalFetch(input, init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null,
  ) {
    const finalUrl = typeof url === "string" ? rewriteUrl(url) : url;
    return originalOpen.call(this, method, finalUrl, async, username, password);
  };
}

/**
 * Service worker used only inside the Capacitor build. It forwards top-level
 * navigations to "/api/*" (the final download redirect) to the real
 * deployment, since the local origin has no such route. On the web we keep
 * the existing PWA service worker untouched.
 */
export function installAppServiceWorker(): void {
  if (typeof window === "undefined" || !isCapacitor()) return;
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
    .then(() => navigator.serviceWorker.register("/app-sw.js", { scope: "/" }))
    .catch(() => {
      /* optional */
    });
}

import { Capacitor } from "@capacitor/core";

export const SMARTLINK_URL =
  "https://www.effectivecpmnetwork.com/srdvkq57st?key=08d1d6c078eaf242cb10e475ef79fdf3";

/**
 * Opens the Adsterra SmartLink in the system browser when running inside the
 * Capacitor app (the ad must run outside the WebView), and in a new tab when on
 * the web. The user is expected to return afterwards to unlock the download.
 */
export async function openSmartLink(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, windowName: "_system" });
      return;
    } catch {
      /* fall through to the web fallback below */
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Watches for the user coming back to the app/tab after the SmartLink was
 * opened and invokes `handler` once. The user must actually leave (the window
 * loses focus / the app goes to background) before a return is accepted; this
 * prevents spurious unlocks when the browser never navigates away. A short
 * absence is re-checked until the minimum is reached. Returns a cleanup fn.
 */
export function onAppReturn(handler: () => void): () => void {
  const MIN_AWAY_MS = 1500;
  let disposed = false;
  let wentAway = false;
  let awaySince = 0;
  let nativeHandle: { remove: () => Promise<void> } | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const markAway = () => {
    if (disposed) return;
    wentAway = true;
    awaySince = Date.now();
  };

  const clearRetry = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  };

  const checkReturn = () => {
    if (disposed || !wentAway) return;
    const elapsed = Date.now() - awaySince;
    if (elapsed < MIN_AWAY_MS) {
      // Returned too quickly to be a real ad view — re-check shortly after.
      clearRetry();
      retryTimer = setTimeout(checkReturn, MIN_AWAY_MS - elapsed + 100);
      return;
    }
    clearRetry();
    wentAway = false;
    handler();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") checkReturn();
    else markAway();
  };

  if (Capacitor.isNativePlatform()) {
    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("appStateChange", (state) => {
          if (state.isActive) checkReturn();
          else markAway();
        }),
      )
      .then((handle) => {
        nativeHandle = handle;
      })
      .catch(() => {
        /* plugin unavailable — web events below still cover it */
      });
  }

  window.addEventListener("blur", markAway);
  window.addEventListener("focus", checkReturn);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    disposed = true;
    clearRetry();
    window.removeEventListener("blur", markAway);
    window.removeEventListener("focus", checkReturn);
    document.removeEventListener("visibilitychange", onVisibility);
    void nativeHandle?.remove();
  };
}

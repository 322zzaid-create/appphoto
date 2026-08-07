let adFired = false;
let gateArmed = false;
let installed = false;
let armedWallpaperId: string | null = null;
let lastProxyCall = 0;
let markerBaseline = new Map<string, string | null>();
let armMarkers = new Map<string, string | null>();
const listeners = new Set<() => void>();

const POLL_MS = 250;
const LAST_OPENED_KEY = "BetterJsPop_lastOpenedAt";
const COUNTER_KEY_RE = /^kad(SS|DS|PD|PP|LT)[0-9a-f]{32}$/;
const PENDING_KEY = "adFiredPending";
const PENDING_TTL = 30 * 60 * 1000;
const WATCH_NONCE_KEY = "adWatchNonce";
let watchNonce: string | null = null;

function notify(source: string) {
  if (adFired) return;
  adFired = true;
  disarmAdGate();
  persistPending();
  console.debug(`[ad-tracker] fired via ${source}`);
  listeners.forEach((cb) => cb());
}

function persistPending() {
  try {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ wallpaperId: armedWallpaperId, ts: Date.now() }),
    );
  } catch {
    /* storage unavailable */
  }
}

function clearPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}

function readPending(): { wallpaperId: string | null; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { wallpaperId?: unknown; ts?: unknown };
    if (
      !parsed ||
      typeof parsed.ts !== "number" ||
      Date.now() - parsed.ts > PENDING_TTL
    ) {
      return null;
    }
    const wallpaperId = typeof parsed.wallpaperId === "string" ? parsed.wallpaperId : null;
    return { wallpaperId, ts: parsed.ts };
  } catch {
    return null;
  }
}

function setWatchNonce(nonce: string | null) {
  watchNonce = nonce;
  try {
    if (nonce === null) {
      sessionStorage.removeItem(WATCH_NONCE_KEY);
    } else {
      sessionStorage.setItem(WATCH_NONCE_KEY, nonce);
    }
  } catch {
    /* storage unavailable */
  }
}

function generateWatchNonce() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readStorageKeys() {
  const out: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key === LAST_OPENED_KEY || COUNTER_KEY_RE.test(key)) {
        out.push(key);
      }
    }
  } catch {
    /* storage unavailable */
  }
  return out;
}

function readMarkers() {
  const map = new Map<string, string | null>();
  for (const key of readStorageKeys()) {
    let value: string | null = null;
    try {
      value = window.localStorage.getItem(key);
    } catch {
      value = null;
    }
    map.set(key, value);
  }
  return map;
}

function markersChangedSinceArm() {
  const current = readMarkers();
  for (const key of readStorageKeys()) {
    const now = current.get(key);
    const before = armMarkers.get(key);
    if (now !== undefined && now !== null && now !== before) {
      return true;
    }
  }
  return false;
}

/**
 * Installed once at page mount. Detects the moment the popunder actually
 * opens, without touching the ad script. The ad redirects the user to a new
 * page, which unloads (or hides) this page, so detection cannot rely on
 * in-memory state alone — it is persisted in sessionStorage and re-checked
 * when the user returns.
 *
 * Signals:
 *  - window.open is intercepted through a Proxy (a plain function wrapper
 *    would show up in window.open.toString() and make popup libraries open
 *    through a path we cannot observe). If the call returns a window the ad
 *    is treated as fired immediately.
 *  - the loader records every open attempt in localStorage
 *    (BetterJsPop_lastOpenedAt plus per-account kad* counters), written in
 *    afterOpen() before the page actually navigates. While the gate is armed
 *    we poll those markers and also re-check them the moment the page is
 *    hidden (pagehide/visibilitychange) — the marker change there proves the
 *    navigation is the ad, so the fired state is persisted before the page
 *    goes away.
 * Outside the gate every signal is ignored and window.open passes through
 * untouched, so normal site behavior is never affected.
 */
export function installAdTracker() {
  if (typeof window === "undefined" || installed) return;
  installed = true;

  const originalOpen = window.open;

  window.open = new Proxy(originalOpen, {
    apply(target, thisArg, args) {
      if (!gateArmed) return Reflect.apply(target, thisArg, args);
      lastProxyCall = Date.now();
      const opened = Reflect.apply(target, thisArg, args);
      if (opened) {
        notify("window.open");
      }
      return opened;
    },
  }) as typeof window.open;

  window.setInterval(() => {
    if (!gateArmed) return;
    const current = readMarkers();
    let changed = false;
    for (const key of readStorageKeys()) {
      const now = current.get(key);
      const before = markerBaseline.get(key);
      if (now !== undefined && now !== null && now !== before) {
        markerBaseline.set(key, now);
        changed = true;
      }
    }
    if (!changed) return;
    if (Date.now() - lastProxyCall > 1500) {
      notify("marker");
    }
  }, POLL_MS);

  window.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (gateArmed && markersChangedSinceArm()) {
        notify("page-hidden");
      }
    } else if (readPending()) {
      // notify() disarms the gate, so on return the pending entry alone
      // proves the ad fired.
      notify("page-visible");
    }
  });

  window.addEventListener("pagehide", () => {
    if (gateArmed && markersChangedSinceArm()) {
      notify("page-hide");
    }
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && readPending()) {
      notify("page-show");
    }
  });
}

export function armAdGate(wallpaperId?: string) {
  gateArmed = true;
  armedWallpaperId = wallpaperId ?? null;
  lastProxyCall = 0;
  markerBaseline = readMarkers();
  armMarkers = readMarkers();
  setWatchNonce(generateWatchNonce());
  clearPending();
}

export function disarmAdGate() {
  gateArmed = false;
}

export function isAdGateArmed() {
  return gateArmed;
}

export function isAdFired(wallpaperId?: string) {
  if (adFired) return true;
  const pending = readPending();
  if (!pending) return false;
  if (wallpaperId && pending.wallpaperId && pending.wallpaperId !== wallpaperId) {
    return false;
  }
  return true;
}

export function subscribeAdFired(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function resetAdFired() {
  adFired = false;
  clearPending();
  setWatchNonce(null);
}

/**
 * Nonce identifying the current (or most recent) ad watch. Survives a full
 * reload via sessionStorage so the download token can still be redeemed after
 * the ad redirects the page away.
 */
export function getAdNonce(): string | null {
  if (watchNonce) return watchNonce;
  try {
    return sessionStorage.getItem(WATCH_NONCE_KEY);
  } catch {
    return null;
  }
}

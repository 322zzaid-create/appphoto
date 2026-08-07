"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Timer, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { POPUNDER_SCRIPT } from "@/lib/constants";
import {
  installAdTracker,
  isAdFired,
  subscribeAdFired,
  resetAdFired,
  armAdGate,
  disarmAdGate,
  getAdNonce,
} from "@/lib/ad/ad-tracker";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaperId: string;
  wallpaperTitle: string;
}

const AD_DURATION = 10;

function injectAdScript(onError?: () => void) {
  const script = document.createElement("script");
  script.text = POPUNDER_SCRIPT;
  script.onerror = onError ?? null;
  document.body.appendChild(script);
}

// Server-side record that the ad was watched. The download token route only
// issues a token when a matching, unconsumed confirmation exists.
async function confirmAdWatch(nonce: string | null, wallpaperId: string) {
  if (!nonce) return;
  try {
    await fetch("/api/ad/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nonce, wallpaperId }),
    });
  } catch {
    /* best-effort; token route still validates the confirmation */
  }
}

export function DownloadModal({
  isOpen,
  onClose,
  wallpaperId,
  wallpaperTitle,
}: DownloadModalProps) {
  const [phase, setPhase] = useState<"gate" | "watching" | "ready" | "failed" | "downloading">(
    "gate",
  );
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [adFailed, setAdFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmedWatch = useRef(false);

  // Install the popunder tracker once at page mount. The ad script itself is
  // only loaded after the user clicks "watch ad" — never before.
  useEffect(() => {
    installAdTracker();
    return subscribeAdFired(() => {
      setPhase((p) => (p === "watching" ? "ready" : p));
    });
  }, []);

  // When the ad is confirmed as watched, record it on the server so the token
  // route can issue a download token.
  useEffect(() => {
    if (phase !== "ready" || confirmedWatch.current) return;
    confirmedWatch.current = true;
    confirmAdWatch(getAdNonce(), wallpaperId);
  }, [phase, wallpaperId]);

  useEffect(() => {
    if (!isOpen) {
      setPhase("gate");
      setCountdown(AD_DURATION);
      setAdFailed(false);
      setError(null);
      confirmedWatch.current = false;
      resetAdFired();
      disarmAdGate();
      return;
    }
    // The popup may have already opened during the click that opened the modal,
    // or the page may have been restored after the ad redirected away.
    if (isAdFired(wallpaperId)) {
      setPhase("ready");
    }
  }, [isOpen, wallpaperId]);

  // 10s countdown while waiting for the ad. It stops the moment the ad is
  // detected (phase flips to "ready") and shows the failure state otherwise.
  useEffect(() => {
    if (phase !== "watching") return;
    if (countdown <= 0) {
      disarmAdGate();
      setPhase("failed");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleWatchAd = useCallback(() => {
    resetAdFired();
    setAdFailed(false);
    setCountdown(AD_DURATION);
    setPhase("watching");
    confirmedWatch.current = false;
    armAdGate(wallpaperId);
    injectAdScript(() => setAdFailed(true));
  }, [wallpaperId]);

  const handleDownload = useCallback(async () => {
    setPhase("downloading");
    try {
      const res = await fetch("/api/download/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallpaperId, nonce: getAdNonce() }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setError(data.error || "Unable to start the download. Please try again.");
        setPhase("ready");
        return;
      }
      window.location.href = `/api/download/${wallpaperId}?token=${encodeURIComponent(data.token)}`;
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
      setPhase("ready");
    }
  }, [wallpaperId, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={phase === "watching" ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {phase === "gate" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Play className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{wallpaperTitle}</h3>
                <p className="mb-6 text-sm text-white/40">
                  شاهد إعلانًا لتنزيل الصورة مجانًا
                </p>
                <Button onClick={handleWatchAd} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  شاهد اعلان لتنزيل الصورة مجانا
                </Button>
              </div>
            )}

            {phase === "watching" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Timer className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">جارٍ تشغيل الإعلان...</h3>
                <p className="mb-6 text-sm text-white/40">{wallpaperTitle}</p>

                <div className="relative mb-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / AD_DURATION) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/30">{countdown}s</p>
                </div>

                <p className="text-sm text-white/50">
                  انقر في أي مكان داخل الصفحة لإظهار الإعلان
                </p>
                <p className="mt-1 text-xs text-white/20">
                  {adFailed
                    ? "تعذر تحميل سكربت الإعلان. سيظهر زر التنزيل في حال فتح الإعلان."
                    : "سيظهر زر التنزيل فور فتح الإعلان."}
                </p>
              </div>
            )}

            {phase === "ready" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">جاهز للتنزيل</h3>
                <p className="mb-6 text-sm text-white/40">{wallpaperTitle}</p>
                {error && (
                  <p className="mb-4 flex items-start justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                )}
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="w-full border-green-600 bg-green-600 text-white hover:bg-green-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  تنزيل الآن
                </Button>
              </div>
            )}

            {phase === "failed" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                  <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">فشل تشغيل الإعلان</h3>
                <p className="mb-6 text-sm text-white/40">
                  لم يتم فتح الإعلان. تأكد من السماح بالنوافذ المنبثقة لهذا الموقع ثم حاول مجددًا.
                </p>
                <Button onClick={handleWatchAd} variant="danger" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  إعادة محاولة التنزيل
                </Button>
              </div>
            )}

            {phase === "downloading" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">بدأ التنزيل!</h3>
                <p className="text-sm text-white/40">جارٍ تنزيل الخلفية.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, CheckCircle2, AlertTriangle, Play, RotateCw } from "lucide-react";
import { BannerAd } from "@/components/ads/banner-ad";
import { SMARTLINK_URL, openSmartLink, onAppReturn } from "@/lib/ad/smartlink";
import { apiUrl, isCapacitor } from "@/lib/app/capacitor";
import { downloadWallpaperWeb, saveWallpaperToDevice } from "@/lib/app/native-download";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/utils/toast";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaperId: string;
  wallpaperTitle: string;
}

const BANNER_AD_KEY = "183638a161eb743d6cabc0a5e0f8b8b4";

/**
 * Returns the current access token so the remote API can resolve the user even
 * when no session cookies reach it (e.g. the Capacitor app calling the
 * deployed API from a locally-served WebView).
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await createClient().auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function DownloadModal({
  isOpen,
  onClose,
  wallpaperId,
  wallpaperTitle,
}: DownloadModalProps) {
  const [phase, setPhase] = useState<"gate" | "ready" | "downloading">("gate");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waitingRef = useRef(false);
  const unlockedRef = useRef(false);
  const returnCleanupRef = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    returnCleanupRef.current?.();
    returnCleanupRef.current = null;
    setPhase("gate");
    setWaiting(false);
    setError(null);
    waitingRef.current = false;
    unlockedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => () => returnCleanupRef.current?.(), []);

  const unlockDownload = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    waitingRef.current = false;
    setWaiting(false);
    setError(null);
    setPhase("ready");
  }, []);

  const handleWatchAd = useCallback(() => {
    if (unlockedRef.current) return;
    if (!waitingRef.current) {
      setError(null);
      waitingRef.current = true;
      setWaiting(true);
      returnCleanupRef.current?.();
      returnCleanupRef.current = onAppReturn(unlockDownload);
    }
    void openSmartLink(SMARTLINK_URL);
  }, [unlockDownload]);

  const requestToken = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(apiUrl("/api/download/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ wallpaperId }),
    });
    const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
    return { ok: res.ok, status: res.status, token: data.token, error: data.error };
  }, [wallpaperId]);

  const performDownload = useCallback(
    async (token: string) => {
      const headers = await authHeaders();
      const url = apiUrl(`/api/download/${wallpaperId}?token=${encodeURIComponent(token)}`);
      if (isCapacitor()) {
        await saveWallpaperToDevice(url, wallpaperTitle, headers);
      } else {
        await downloadWallpaperWeb(url, `${wallpaperTitle}.jpg`, headers);
      }
    },
    [wallpaperId, wallpaperTitle],
  );

  const handleDownload = useCallback(async () => {
    setPhase("downloading");
    try {
      const result = await requestToken();
      if (!result.ok || !result.token) {
        setError(result.error || "Unable to start the download. Please try again.");
        setPhase("ready");
        return;
      }
      await performDownload(result.token);
      if (isCapacitor()) toast.success("تم حفظ الخلفية على جهازك");
      setTimeout(() => onClose(), 1500);
    } catch {
      setError(
        isCapacitor()
          ? "تعذّر حفظ الملف على الجهاز. حاول مرة أخرى."
          : "Network error. Please try again.",
      );
      setPhase("ready");
    }
  }, [requestToken, performDownload, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
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
              <div className="p-6 text-center">
                <h3 className="mb-1 text-lg font-bold text-white">{wallpaperTitle}</h3>
                <p className="mb-5 text-sm text-white/40">
                  شاهد إعلانًا لتنزيل الصورة مجانًا
                </p>
                <div className="mb-5 flex justify-center">
                  <BannerAd adKey={BANNER_AD_KEY} />
                </div>
                <Button onClick={handleWatchAd} className="w-full">
                  {waiting ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4" />
                      إعادة فتح الإعلان
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      شاهد اعلان لتنزيل الصورة مجانا
                    </>
                  )}
                </Button>
                <p className="mt-3 text-xs text-white/40">
                  {waiting
                    ? "سيتم تفعيل زر التنزيل تلقائيًا عند عودتك من الإعلان"
                    : "سيتم نقلك إلى المتصفح لمشاهدة الإعلان، ثم تعود تلقائيًا لتفعيل التنزيل"}
                </p>
                {error && (
                  <p className="mt-3 flex items-start justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                )}
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
                  onClick={() => {
                    void handleDownload();
                  }}
                  variant="secondary"
                  className="w-full border-green-600 bg-green-600 text-white hover:bg-green-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  تنزيل الآن
                </Button>
              </div>
            )}

            {phase === "downloading" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {isCapacitor() ? "جارٍ حفظ الخلفية على جهازك..." : "بدأ التنزيل!"}
                </h3>
                <p className="text-sm text-white/40">
                  {isCapacitor()
                    ? "يتم الآن حفظ الصورة على الجهاز"
                    : "جارٍ تنزيل الخلفية."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

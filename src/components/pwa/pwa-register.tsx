"use client";

import { useEffect } from "react";
import { isCapacitor } from "@/lib/app/capacitor";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (isCapacitor()) return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* offline/install support is optional */
    });
  }, []);

  return null;
}

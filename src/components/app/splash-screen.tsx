"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "apex-splash-shown";

type Phase = "shown" | "hidden" | "done";

function getInitialPhase(): Phase {
  if (typeof window === "undefined") return "shown";
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1" ? "done" : "shown";
  } catch {
    return "shown";
  }
}

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>(getInitialPhase);

  useEffect(() => {
    if (phase === "done") return;

    const hold = setTimeout(() => setPhase("hidden"), 2300);
    const finish = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("done");
    }, 3100);

    return () => {
      clearTimeout(hold);
      clearTimeout(finish);
    };
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.img
            src="/logo.jpg"
            alt=""
            className="h-32 w-32 object-contain sm:h-40 sm:w-40"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          />
          <motion.span
            className="mt-6 text-xl font-semibold tracking-[0.35em] text-white/80 uppercase"
            initial={{ opacity: 0, letterSpacing: "0.7em" }}
            animate={{ opacity: 1, letterSpacing: "0.35em" }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
          >
            apex
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

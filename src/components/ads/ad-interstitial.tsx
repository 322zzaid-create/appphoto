"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdInterstitialProps {
  open: boolean;
  onClose: () => void;
  onSkip?: () => void;
  duration?: number;
  className?: string;
}

export const AdInterstitial = forwardRef<HTMLDivElement, AdInterstitialProps>(
  ({ open, onClose, onSkip, duration = 5, className }, ref) => {
    return (
      <AnimatePresence>
        {open && (
          <div ref={ref} className={cn("fixed inset-0 z-[60] flex items-center justify-center", className)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex w-full max-w-lg flex-col items-center rounded-2xl border border-white/10 bg-[#0f0f1a]/95 p-8 backdrop-blur-2xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="mb-4 text-xs uppercase tracking-wider text-white/30">Advertisement</p>

              <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
                <p className="text-sm text-white/20">Ad Content</p>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  Skip in {duration}s
                </Button>
                <Button size="sm" onClick={onClose}>
                  Continue
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

AdInterstitial.displayName = "AdInterstitial";

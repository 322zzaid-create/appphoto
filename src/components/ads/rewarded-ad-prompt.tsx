"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader } from "@/components/ui/modal";
import { Play, Download, X } from "lucide-react";

interface RewardedAdPromptProps {
  open: boolean;
  onClose: () => void;
  onReward: () => void;
  onSkipAd?: () => void;
  loading?: boolean;
  className?: string;
}

export function RewardedAdPrompt({
  open,
  onClose,
  onReward,
  onSkipAd,
  loading = false,
  className,
}: RewardedAdPromptProps) {
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleWatch = useCallback(() => {
    setWatching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setWatching(false);
          onReward();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  }, [onReward]);

  return (
    <Modal open={open} onClose={onClose} size="sm" className={className}>
      <ModalHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <Download className="h-6 w-6 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Download HD Quality</h2>
        <p className="mt-1 text-sm text-white/40">
          Watch a short ad to download this wallpaper in full resolution
        </p>
      </ModalHeader>
      <ModalContent className="space-y-4 pt-2">
        {watching && (
          <div className="space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-center text-xs text-white/30">
              Watching ad... {Math.round(progress / 5)}s remaining
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!watching && (
            <Button variant="secondary" onClick={onClose} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            onClick={handleWatch}
            disabled={watching || loading}
            loading={loading}
            className="flex-1"
          >
            <Play className="mr-2 h-4 w-4" fill="currentColor" />
            {watching ? "Watching..." : "Watch Ad"}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

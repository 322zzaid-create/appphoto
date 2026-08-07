"use client";

import { forwardRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[90vw]",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: keyof typeof sizeMap;
  children: React.ReactNode;
  className?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, size = "md", children, className }, ref) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      },
      [onClose],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [open, handleEscape]);

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "relative w-full rounded-2xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl shadow-2xl",
                sizeMap[size],
                className,
              )}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = "Modal";

export const ModalHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b border-white/10 px-6 py-4", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

export const ModalContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
ModalContent.displayName = "ModalContent";

export const ModalFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4",
      className,
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

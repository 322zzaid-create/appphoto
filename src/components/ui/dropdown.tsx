"use client";

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  className?: string;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ trigger, items, onSelect, align = "left", className }, _ref) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    return (
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        <div onClick={() => setOpen(!open)} className="cursor-pointer">
          {trigger}
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-1.5 backdrop-blur-2xl shadow-2xl",
                align === "right" ? "right-0" : "left-0",
              )}
            >
              {items.map((item) =>
                item.separator ? (
                  <div key={item.label} className="my-1 border-t border-white/10" />
                ) : (
                  <button
                    key={item.value}
                    disabled={item.disabled}
                    onClick={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      item.danger
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                      item.disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    {item.label}
                  </button>
                ),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

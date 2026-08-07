"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  disabled = false,
  label,
  error,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.(val);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border bg-white/5 px-3 py-2 text-sm backdrop-blur-xl transition-all",
          "hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50",
          open && "border-purple-500/50 ring-2 ring-purple-500/50",
          error ? "border-red-500/50" : "border-white/10",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className={cn("truncate", selected ? "text-white" : "text-white/40")}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon}
              {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-white/40 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f0f1a]/95 shadow-2xl backdrop-blur-2xl"
          >
            {searchable && (
              <div className="border-b border-white/10 p-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-full rounded-lg bg-white/5 pl-8 pr-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/30">No results</p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      value === option.value
                        ? "bg-purple-500/20 text-purple-300"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                      option.disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="flex-1 text-left truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0 text-purple-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

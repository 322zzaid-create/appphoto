"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";

const deviceTypes = [
  { label: "All", value: "all" },
  { label: "Phone", value: "phone" },
  { label: "Tablet", value: "tablet" },
  { label: "Desktop", value: "desktop" },
  { label: "TV", value: "tv" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Most Downloaded", value: "most_downloaded" },
  { label: "Most Viewed", value: "popular" },
];

const categoryOptions = CATEGORIES.map((c) => ({ label: c.name, value: c.slug }));

export interface WallpaperFilters {
  device: string;
  category: string[];
  sort: string;
}

interface WallpaperFiltersProps {
  filters: WallpaperFilters;
  onChange: (filters: WallpaperFilters) => void;
  className?: string;
}

export function WallpaperFilters({
  filters,
  onChange,
  className,
}: WallpaperFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (partial: Partial<WallpaperFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({
      device: "all",
      category: [],
      sort: "newest",
    });
  };

  const activeCount = [
    filters.device !== "all",
    filters.category.length > 0,
  ].filter(Boolean).length;

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <Select
        label="Device"
        options={deviceTypes}
        value={filters.device}
        onChange={(v) => update({ device: v })}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Categories</label>
        <div className="flex flex-wrap gap-1.5">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                const cats = filters.category.includes(cat.value)
                  ? filters.category.filter((c) => c !== cat.value)
                  : [...filters.category, cat.value];
                update({ category: cats });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filters.category.includes(cat.value)
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <Select
        label="Sort By"
        options={sortOptions}
        value={filters.sort}
        onChange={(v) => update({ sort: v })}
      />
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition-colors hover:bg-white/10",
            activeCount > 0 && "border-purple-500/30 text-purple-400",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24 w-64 shrink-0">{filterContent}</div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-[#0a0a0f]/95 p-6 backdrop-blur-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterContent}
              <div className="mt-8">
                <Button className="w-full" onClick={() => setMobileOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

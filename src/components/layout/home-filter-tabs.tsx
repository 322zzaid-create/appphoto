"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { LayoutGrid, Monitor, Smartphone, UserRound } from "lucide-react";

export type HomeFilterId = "all" | "desktop" | "phone" | "profile";

const tabs = [
  { id: "all" as const, label: "All", icon: LayoutGrid },
  { id: "desktop" as const, label: "Desktop", icon: Monitor },
  { id: "phone" as const, label: "Phone", icon: Smartphone },
  { id: "profile" as const, label: "Profile", icon: UserRound },
];

interface HomeFilterTabsProps {
  active: HomeFilterId;
  onChange: (id: HomeFilterId) => void;
}

export function HomeFilterTabs({ active, onChange }: HomeFilterTabsProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="relative flex rounded-2xl border border-white/10 bg-[#0a0a0f]/70 p-1.5 shadow-tabbar backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-300",
                "active:scale-[0.97]",
                isActive ? "text-white" : "text-white/45 hover:text-white/75",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="home-filter-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/25 to-blue-500/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/10"
                />
              )}

              <motion.span
                animate={{ y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="relative flex items-center gap-1.5"
              >
                <Icon
                  className={cn("h-4 w-4", isActive && "text-purple-300")}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

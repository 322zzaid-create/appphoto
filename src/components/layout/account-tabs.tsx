"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { User, Sparkles } from "lucide-react";

export type AccountTabId = "profile" | "studio";

const tabs = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "studio" as const, label: "Studio", icon: Sparkles },
];

interface AccountTabsProps {
  active: AccountTabId;
  onChange: (id: AccountTabId) => void;
}

export function AccountTabs({ active, onChange }: AccountTabsProps) {
  return (
    <div className="relative z-[60] -mt-6">
      <div className="mx-auto max-w-md">
        <div className="relative flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300",
                  "active:scale-[0.97]",
                  isActive ? "text-white" : "text-white/45 hover:text-white/75",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="account-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 -top-2 bottom-0 rounded-b-2xl border border-t-0 border-white/10 bg-[#0a0a0f] shadow-[0_12px_28px_-12px_rgba(0,0,0,0.9)]"
                  />
                )}

                <motion.span
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="relative flex items-center gap-2"
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
    </div>
  );
}

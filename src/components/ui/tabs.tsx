"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(activeTab ?? tabs[0]?.id);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentActive = activeTab ?? active;

  const handleChange = (id: string) => {
    setActive(id);
    onChange(id);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            currentActive === tab.id ? "text-white" : "text-white/50 hover:text-white/70",
          )}
        >
          {currentActive === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-white/10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps {
  activeTab: string;
  tabId: string;
  children: React.ReactNode;
}

export function TabPanel({ activeTab, tabId, children }: TabPanelProps) {
  if (activeTab !== tabId) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

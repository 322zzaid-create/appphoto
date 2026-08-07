"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  Compass,
  Grid3X3,
  Heart,
  Download,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

const quickLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: Compass },
  { label: "Categories", href: "/categories", icon: Grid3X3 },
  { label: "Studio", href: "/studio", icon: Sparkles },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Downloads", href: "/downloads", icon: Download },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar({
  collapsed = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 260 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl lg:block"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-white/50 hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

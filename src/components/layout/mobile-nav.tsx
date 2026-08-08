"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Home, Compass, Sparkles } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: Compass },
  { label: "Studio", href: "/studio", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pt-2 lg:hidden">
      <div
        className={cn(
          "mx-auto flex max-w-md items-center justify-around rounded-2xl",
          "border border-white/10 bg-[#0d0d16]/90 shadow-tabbar backdrop-blur-2xl",
          "px-2 pb-safe",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-colors",
                active ? "text-white" : "text-white/40",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-xl transition-colors duration-200",
                  active
                    ? "bg-gradient-to-br from-purple-500/25 to-blue-500/25 text-purple-300"
                    : "text-inherit",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-xl border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

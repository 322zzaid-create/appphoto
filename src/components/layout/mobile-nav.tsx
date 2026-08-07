"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, Compass, Search, Heart, Bell, Sparkles } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: Compass },
  { label: "Studio", href: "/studio", icon: Sparkles },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Alerts", href: "/notifications", icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0f]/90 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors",
                isActive ? "text-purple-400" : "text-white/40",
              )}
            >
              {isActive && (
                <div className="absolute -top-1 h-0.5 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

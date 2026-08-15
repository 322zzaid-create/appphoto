"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Home, Compass, Newspaper, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: Compass },
  { label: "Posts", href: "/posts", icon: Newspaper },
  { label: "Profile", href: "/account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  // The static export adds a trailing slash (e.g. "/profile/"), so normalize
  // before comparing against exact routes.
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/profile") return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/account")
      return pathname.startsWith("/account") || pathname.startsWith("/profile");
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-safe">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 nav-fade" />
      <div className="relative mb-6 flex items-center gap-1 rounded-full bg-[#0d0d16]/90 p-1.5 shadow-tabbar backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300",
                "active:scale-90",
                active ? "text-white" : "text-white/45 hover:text-white/75",
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/25 to-blue-500/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                />
              )}

              <motion.span
                animate={{
                  y: active ? -1 : 0,
                  scale: active ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full",
                  active ? "text-purple-300" : "text-inherit",
                )}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.4 : 1.8}
                />
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

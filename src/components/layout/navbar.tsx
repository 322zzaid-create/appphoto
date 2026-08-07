"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Categories", href: "/categories" },
];

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { siteName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userProfile = isAuthenticated && user
    ? { name: user.full_name || user.username, avatar: user.avatar_url ?? undefined }
    : null;

  const userMenuItems = userProfile
    ? [
        { label: "Profile", value: "profile", icon: <span className="text-sm">👤</span> },
        ...(user?.role === "admin"
          ? [{ label: "Admin Panel", value: "admin", icon: <span className="text-sm">🛡️</span> }]
          : []),
        { label: "", value: "separator", separator: true },
        { label: "Logout", value: "logout", danger: true },
      ]
    : [];

  const handleDropdownSelect = useCallback(
    (value: string) => {
      if (value === "logout") {
        logout();
        router.push("/");
      } else if (value === "profile") {
        router.push("/profile");
      } else if (value === "admin") {
        router.push("/admin");
      }
    },
    [logout, router]
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b pt-safe transition-all duration-300",
        "border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl",
        scrolled && "shadow-lg",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-bold text-white">{siteName}</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userProfile && (
            <Link
              href="/notifications"
              className="relative rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-5 w-5" />
            </Link>
          )}

          {userProfile ? (
            <Dropdown
              trigger={
                <Avatar src={userProfile.avatar} name={userProfile.name} size="sm" />
              }
              items={userMenuItems}
              align="right"
              onSelect={handleDropdownSelect}
            />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-2 pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

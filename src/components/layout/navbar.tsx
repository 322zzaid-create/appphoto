"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Menu, X, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Categories", href: "/categories" },
];

export function Navbar() {
  const { user } = useAuth();
  const { siteName } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b pt-safe transition-all duration-300",
          "border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl",
          scrolled && "shadow-lg",
        )}
      >
        <div className="relative mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-12">
          {/* Left: Search */}
          <div className="flex w-9 items-center md:w-11">
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>

          {/* Center: Logo + name */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-purple-500 to-blue-500">
              <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-base font-bold text-white">{siteName}</span>
          </div>

          {/* Right: Menu */}
          <div className="flex w-9 items-center justify-end md:w-11">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
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
              className="overflow-hidden border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl"
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

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                {!user && (
                  <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
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

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

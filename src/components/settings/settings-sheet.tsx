"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils/cn";
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  Shield,
  FileText,
  Mail,
  Info,
  ExternalLink,
  User,
} from "lucide-react";

const CONTACT_EMAIL = "zerotime2025@gmail.com";
const ABOUT_URL = "https://zt-zerotime.vercel.app/";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const router = useRouter();
  const { user, session, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    onClose();
    router.push("/");
  };

  const handleAbout = () => {
    onClose();
    window.open(ABOUT_URL, "_blank", "noopener,noreferrer");
  };

  const handleContact = () => {
    onClose();
    window.location.href = `mailto:${CONTACT_EMAIL}`;
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" className="!p-0">
      <div className="px-6 pb-8 pt-6">
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <p className="mt-1 text-xs text-white/40">
          Preferences, legal info and your account.
        </p>

        {/* Appearance */}
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Appearance
          </h3>
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                theme === "light"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                  : "text-white/60 hover:text-white",
              )}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                  : "text-white/60 hover:text-white",
              )}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Account
          </h3>
          {isLoading ? (
            <div className="h-11 animate-pulse rounded-xl bg-white/10" />
          ) : isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.full_name || user.username}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="md"
                className="w-full"
                loading={loggingOut}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            <Link href="/login" onClick={onClose} className="block">
              <Button size="md" className="w-full">
                <LogIn className="h-4 w-4" />
                Log in
              </Button>
            </Link>
          )}
        </section>

        {/* Legal */}
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Legal
          </h3>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <Link
              href="/privacy"
              onClick={onClose}
              className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Shield className="h-4 w-4 shrink-0 text-white/40" />
              Privacy Policy
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/20" />
            </Link>
            <Link
              href="/terms"
              onClick={onClose}
              className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-4 w-4 shrink-0 text-white/40" />
              Terms of Service
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/20" />
            </Link>
            <button
              onClick={handleContact}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0 text-white/40" />
              Contact Us
            </button>
          </div>
        </section>

        {/* About */}
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            About
          </h3>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAbout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Info className="h-4 w-4 shrink-0 text-white/40" />
            About this app
            <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/20" />
          </motion.button>
        </section>
      </div>
    </Modal>
  );
}

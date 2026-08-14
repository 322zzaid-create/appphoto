"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";

const EXEMPT_PATHS = ["/login", "/register"];

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { maintenanceMode, isLoading: settingsLoading } = useSettings();
  const { user, isLoading: authLoading } = useAuth();

  if (EXEMPT_PATHS.includes(pathname ?? "")) return <>{children}</>;

  // Wait for auth + settings before deciding to avoid flashing the app
  // during maintenance mode.
  if (settingsLoading || authLoading) return <>{children}</>;

  if (maintenanceMode && user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 ring-1 ring-white/10">
            <Wrench className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Under Maintenance</h1>
          <p className="mt-3 max-w-md text-sm text-white/50">
            We&apos;re making some improvements. Please check back soon.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

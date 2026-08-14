"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AccountTabs, type AccountTabId } from "@/components/layout/account-tabs";
import { EmbeddedAuth } from "@/components/auth/embedded-auth";
import { useAuth } from "@/lib/hooks/useAuth";
import ProfilePage from "@/app/(main)/profile/page";
import StudioPage from "@/app/(main)/studio/page";

export default function AccountPage() {
  const [tab, setTab] = useState<AccountTabId>("profile");
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <AccountTabs active={tab} onChange={setTab} />

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {tab === "profile" ? (
              isAuthenticated ? (
                <ProfilePage />
              ) : (
                <EmbeddedAuth />
              )
            ) : (
              <StudioPage />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

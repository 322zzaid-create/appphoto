"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AuthBackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.replace("/");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back to app"
      className="fixed left-4 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

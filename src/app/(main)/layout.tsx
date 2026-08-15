"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-bg min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="pt-[calc(2.75rem+env(safe-area-inset-top))] md:pt-[calc(3rem+env(safe-area-inset-top))] lg:pl-[260px] pb-28 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

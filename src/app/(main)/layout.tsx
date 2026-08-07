"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-[260px] pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

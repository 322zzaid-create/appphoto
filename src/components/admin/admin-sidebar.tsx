"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  Users,
  Settings,
  Megaphone,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Wallpapers", href: "/admin/wallpapers", icon: Image },
  { label: "Studios", href: "/admin/studios", icon: Sparkles },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Ads", href: "/admin/ads", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-60 border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl lg:block",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-[10px] font-bold text-purple-400">
              A
            </span>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}

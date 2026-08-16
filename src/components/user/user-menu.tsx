"use client";

import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import {
  User,
  Bookmark,
  Download,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

interface UserMenuProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    isAdmin?: boolean;
  };
  onLogout?: () => void;
  className?: string;
}

export function UserMenu({ user, onLogout, className }: UserMenuProps) {
  const items = [
    { label: "Profile", value: "profile", icon: <User className="h-4 w-4" /> },
    { label: "Saved", value: "favorites", icon: <Bookmark className="h-4 w-4" /> },
    { label: "Downloads", value: "downloads", icon: <Download className="h-4 w-4" /> },
    { label: "Settings", value: "settings", icon: <Settings className="h-4 w-4" /> },
    ...(user.isAdmin
      ? [
          { label: "", value: "sep", separator: true },
          { label: "Admin Panel", value: "admin", icon: <Shield className="h-4 w-4" /> },
        ]
      : []),
    { label: "", value: "sep2", separator: true },
    { label: "Logout", value: "logout", icon: <LogOut className="h-4 w-4" />, danger: true },
  ];

  return (
    <Dropdown
      className={className}
      trigger={
        <div className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-white/5">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            {user.email && (
              <p className="text-[11px] text-white/40">{user.email}</p>
            )}
          </div>
        </div>
      }
      items={items}
      align="right"
      onSelect={(v) => {
        if (v === "logout") onLogout?.();
      }}
    />
  );
}

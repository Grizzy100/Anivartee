"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  User,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserStatsCard } from "./UserStatsCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import type { DashboardRole } from "./types";

// ─── Navigation items ────────────────────────────────────────────────────────

/** Items shown to every authenticated user. */
const commonNavItems = [
  { label: "Home", icon: Home, path: "" },
  { label: "My Posts", icon: FileText, path: "/posts" },
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Subscription", icon: CreditCard, path: "/subscription" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

/** Extra item shown only in the fact-checker sidebar. */
const moderationNavItem = {
  label: "Moderation Queue",
  icon: ShieldCheck,
  path: "/moderation",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
  role: DashboardRole;
}

export function Sidebar({ role }: SidebarProps) {
  const basePath =
    role === "factchecker" ? "/fact-checker" : "/user";
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.username || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-background border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-2 border-b border-border">
        <div className="flex flex-col items-center gap-0.5">
          <Image
            src="/images/logo-new-removebg-preview.png"
            alt="Anvartee"
            width={200}
            height={80}
            className="h-20 w-auto object-contain scale-125"
            priority
          />
          <ToggleTheme />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {commonNavItems.map((item) => {
          const fullPath = item.path ? `${basePath}${item.path}` : basePath;
          const isActive = pathname === fullPath;

          return (
            <Link
              key={item.label}
              href={fullPath}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative group",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <item.icon className="w-5 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Fact-checker-only: Moderation Queue */}
        {role === "factchecker" && (() => {
          const fullPath = `${basePath}${moderationNavItem.path}`;
          const isActive = pathname === fullPath;
          const Icon = moderationNavItem.icon;
          return (
            <>
              <div className="my-2 mx-3 h-px bg-border" />
              <Link
                href={fullPath}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative group",
                  isActive
                    ? "text-emerald-500 bg-emerald-500/10"
                    : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{moderationNavItem.label}</span>
              </Link>
            </>
          );
        })()}
      </nav>

      {/* User Stats */}
      <div className="px-3 pb-3">
        <UserStatsCard
          role={role}
          displayName={displayName}
          initials={initials}
        />
      </div>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

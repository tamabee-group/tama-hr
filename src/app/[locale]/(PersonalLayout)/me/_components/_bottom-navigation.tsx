"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Plane, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

// ============================================
// Navigation Items
// ============================================

const navItems: NavItem[] = [
  { key: "home", href: "/me", icon: Home },
  { key: "schedule", href: "/me/schedule", icon: Calendar },
  { key: "leave", href: "/me/leave", icon: Plane },
  { key: "payroll", href: "/me/payroll", icon: Wallet },
  { key: "profile", href: "/me/profile", icon: User },
];

// ============================================
// Component
// ============================================

export function BottomNavigation() {
  const t = useTranslations("portal.mobileNav");
  const pathname = usePathname();

  // Lấy locale từ pathname
  const locale = pathname.split("/")[1];

  // Kiểm tra active state
  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    // Exact match cho home, prefix match cho các route khác
    if (href === "/me") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <nav
      className={cn(
        // Fixed bottom bar
        "fixed bottom-2 left-2 right-2 z-50 rounded-4xl",
        // Chỉ hiển thị trên mobile
        "md:hidden",
        // Glass styling
        "backdrop-blur-xl",
        "bg-white/80 dark:bg-gray-900/80",
        "border border-primary",
        // Safe area padding cho iPhone
        "pb-safe",
      )}
      aria-label={t("ariaLabel")}
    >
      <div className="grid grid-cols-5 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors",
                active
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110",
                )}
              />
              <span className="text-xs font-medium">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

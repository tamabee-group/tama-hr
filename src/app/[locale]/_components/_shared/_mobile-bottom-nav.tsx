"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface MobileNavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
  /** Các URL patterns để match active state */
  activePatterns?: string[];
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
  className?: string;
}

// ============================================
// MobileBottomNav Component
// ============================================

/**
 * Bottom navigation bar cho mobile devices
 * Hiển thị các key actions với large tappable buttons (min 44px)
 * Chỉ hiển thị trên mobile (hidden on md+)
 */
export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Kiểm tra item có active không
  const isActive = (item: MobileNavItem): boolean => {
    // Check exact match
    if (pathname === item.url) return true;

    // Check pattern matches
    if (item.activePatterns) {
      return item.activePatterns.some((pattern) =>
        pathname.startsWith(pattern),
      );
    }

    // Check if pathname starts with item url (for nested routes)
    return pathname.startsWith(item.url);
  };

  return (
    <nav
      className={cn(
        // Fixed bottom, full width
        "fixed bottom-0 left-0 right-0 z-50",
        // Background và border
        "bg-background border-t border-border",
        // Safe area padding cho notch devices
        "pb-safe",
        // Chỉ hiển thị trên mobile
        "md:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                // Layout
                "flex flex-col items-center justify-center",
                // Size - min 44px cho touch target
                "min-w-[64px] min-h-[44px] py-1 px-2",
                // Touch feedback
                "touch-manipulation active:scale-95 transition-transform",
                // Colors
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Icon */}
              <span
                className={cn(
                  "flex items-center justify-center",
                  "[&>svg]:h-5 [&>svg]:w-5",
                  active && "[&>svg]:stroke-[2.5px]",
                )}
              >
                {item.icon}
              </span>
              {/* Label */}
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium truncate max-w-[60px]",
                  active && "font-semibold",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

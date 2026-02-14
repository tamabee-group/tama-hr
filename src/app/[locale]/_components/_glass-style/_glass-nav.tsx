"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ============================================
// Types
// ============================================

interface GlassNavItem {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface GlassNavProps {
  items: GlassNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

// ============================================
// Styles
// ============================================

// Base glass styling cho nav container
const containerGlassStyles = [
  // Backdrop blur effect
  "backdrop-blur-xl",
  // Translucent background - light mode
  "bg-white/70",
  // Translucent background - dark mode
  "dark:bg-white/10",
  // Border styling
  "border",
  "border-gray-200/80",
  "dark:border-white/20",
  // Rounded corners
  "rounded-2xl",
  // Shadow
  "shadow-lg",
  "shadow-gray-200/50",
  "dark:shadow-xl",
  "dark:shadow-black/20",
  // Padding
  "p-2",
];

// Nav item base styles
const navItemBaseStyles = [
  "flex",
  "items-center",
  "gap-3",
  "w-full",
  "px-3",
  "py-2.5",
  "rounded-xl",
  "text-sm",
  "font-medium",
  "transition-all",
  "duration-200",
  "cursor-pointer",
  // Focus state
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-primary/50",
];

// Nav item inactive styles
const navItemInactiveStyles = [
  "text-muted-foreground",
  "hover:text-foreground",
  "hover:bg-white/50",
  "dark:hover:bg-white/5",
];

// Nav item active styles
const navItemActiveStyles = [
  "text-primary",
  "bg-primary/10",
  "dark:bg-primary/20",
];

// ============================================
// Component
// ============================================

/**
 * GlassNav - Navigation sidebar với glass effect
 * Thay thế Card + Button navigation trong các trang settings
 */
export function GlassNav({
  items,
  activeKey,
  onSelect,
  className,
}: GlassNavProps) {
  return (
    <nav className={cn(containerGlassStyles, className)}>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              className={cn(
                navItemBaseStyles,
                isActive ? navItemActiveStyles : navItemInactiveStyles,
              )}
              onClick={() => onSelect(item.key)}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================
// Exports
// ============================================

export type { GlassNavProps, GlassNavItem };

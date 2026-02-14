"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "interactive";
  onClick?: () => void;
}

// ============================================
// Styles
// ============================================

// Base glass styling - iOS Liquid Glass design
const baseGlassStyles = [
  // Backdrop blur effect
  "backdrop-blur-xl",
  // Translucent background - light mode
  "bg-white/70",
  // Translucent background - dark mode
  "dark:bg-white/10",
  // Border styling - light mode có viền rõ hơn
  "border",
  "border-gray-200/80",
  "dark:border-white/20",
  // Rounded corners (24px)
  "rounded-3xl",
  // Shadow - light mode có shadow nhẹ để tạo chiều sâu
  "shadow-lg",
  "shadow-gray-200/50",
  "dark:shadow-xl",
  "dark:shadow-black/20",
  // Smooth transitions
  "transition-all",
  "duration-200",
];

// Variant-specific styles
const variantStyles = {
  default: [],
  highlighted: [
    // Stronger background for highlighted cards
    "bg-white/80",
    "dark:bg-white/15",
    // Accent border
    "border-primary/40",
    "dark:border-primary/40",
    // Enhanced shadow with color accent
    "shadow-primary/20",
    "dark:shadow-primary/20",
  ],
  interactive: [
    // Cursor pointer
    "cursor-pointer",
    // Hover effects
    "hover:bg-white/80",
    "dark:hover:bg-white/15",
    "hover:shadow-xl",
    "hover:border-gray-300/80",
    "dark:hover:shadow-2xl",
    "dark:hover:border-white/30",
    "hover:scale-[1.01]",
    // Active state
    "active:scale-[0.99]",
    // Focus state for accessibility
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary/50",
    "focus-visible:ring-offset-2",
  ],
};

// ============================================
// Component
// ============================================

export function GlassCard({
  children,
  className,
  variant = "default",
  onClick,
}: GlassCardProps) {
  // Xác định element type dựa trên onClick
  const isInteractive = variant === "interactive" || !!onClick;
  const Component = isInteractive ? "button" : "div";

  return (
    <Component
      className={cn(
        baseGlassStyles,
        variantStyles[variant],
        // Thêm interactive styles nếu có onClick nhưng variant không phải interactive
        onClick && variant !== "interactive" && variantStyles.interactive,
        className,
      )}
      onClick={onClick}
      {...(isInteractive && {
        type: "button" as const,
        "aria-label": "Glass card button",
      })}
    >
      {children}
    </Component>
  );
}

// ============================================
// Exports
// ============================================

export type { GlassCardProps };

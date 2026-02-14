"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface GlassSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
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
  // Border styling
  "border",
  "border-gray-200/80",
  "dark:border-white/20",
  // Rounded corners (16px)
  "rounded-2xl",
  // Shadow
  "shadow-lg",
  "shadow-gray-200/50",
  "dark:shadow-xl",
  "dark:shadow-black/20",
  // Padding
  "p-6",
];

// ============================================
// Component
// ============================================

/**
 * GlassSection - Container với glass effect cho các form sections
 * Thay thế Card component trong các trang settings
 */
export function GlassSection({
  children,
  className,
  title,
  description,
  icon,
  headerAction,
}: GlassSectionProps) {
  return (
    <div className={cn(baseGlassStyles, className)}>
      {/* Header nếu có title */}
      {(title || description || headerAction) && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <div className="flex items-center gap-2 mb-1">
                  {icon && <span className="text-primary">{icon}</span>}
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                </div>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export type { GlassSectionProps };

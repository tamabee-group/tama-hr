"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface GlassTabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassTabsProps {
  tabs: GlassTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// ============================================
// Component
// ============================================

export function GlassTabs({
  tabs,
  value,
  onChange,
  className,
}: GlassTabsProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0",
        className,
      )}
    >
      <div className="inline-flex w-full min-w-fit bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-200/80 dark:border-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-xl py-2 px-3 text-sm font-medium transition-colors border whitespace-nowrap",
              value === tab.value
                ? "bg-white dark:bg-white/10 text-foreground shadow-sm border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.icon}
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

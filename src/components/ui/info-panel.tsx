"use client";

import * as React from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoItem {
  label: string;
  description: string;
}

interface InfoPanelProps {
  title: string;
  items: InfoItem[];
  defaultOpen?: boolean;
  className?: string;
}

/**
 * InfoPanel - Panel collapsible chứa tất cả giải thích
 * Gom tất cả thông tin về 1 chỗ, giữ form clean
 */
export function InfoPanel({
  title,
  items,
  defaultOpen = false,
  className,
}: InfoPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-blue-200/50 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4" />
          {title}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-blue-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-foreground">{item.label}:</span>{" "}
              <span className="text-muted-foreground">{item.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

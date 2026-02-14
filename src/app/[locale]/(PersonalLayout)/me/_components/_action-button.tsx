"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format-date-time";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  time?: string;
  state: { active: boolean; completed: boolean };
  onClick: () => void;
  isSubmitting: boolean;
  variant: "success" | "warning" | "info" | "destructive";
}

// ============================================
// Styles
// ============================================

const variantStyles = {
  success: {
    active:
      "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 shadow-lg",
    completed:
      "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  },
  warning: {
    active:
      "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/20 shadow-lg",
    completed:
      "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  },
  info: {
    active:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-lg",
    completed:
      "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  },
  destructive: {
    active:
      "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg",
    completed:
      "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  },
};

// Style chung cho disabled buttons
const disabledStyle =
  "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500";

// ============================================
// Component
// ============================================

export function ActionButton({
  icon,
  label,
  time,
  state,
  onClick,
  isSubmitting,
  variant,
}: ActionButtonProps) {
  const { active, completed } = state;
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      className={cn(
        "flex h-14 w-full items-center justify-between rounded-2xl px-4 transition-all",
        completed
          ? styles.completed + " border"
          : active
            ? styles.active
            : disabledStyle,
      )}
      onClick={onClick}
      disabled={!active || isSubmitting}
    >
      <span className="flex items-center gap-3">
        {isSubmitting && active ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          icon
        )}
        <span className="font-medium">{label}</span>
      </span>
      {time && (
        <Badge
          variant="secondary"
          className={cn(
            "border-0 text-xs",
            active || completed
              ? "bg-white/20 dark:bg-black/20"
              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
          )}
        >
          {formatTime(time)}
        </Badge>
      )}
      {completed && !time && (
        <Badge
          variant="secondary"
          className="border-0 bg-white/20 text-xs dark:bg-black/20"
        >
          ✓
        </Badge>
      )}
    </button>
  );
}

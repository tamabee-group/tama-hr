"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { formatDate } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface SwipeDayNavigatorProps {
  /** Ngày hiện tại đang xem */
  currentDate: Date;
  /** Callback khi chuyển ngày */
  onDateChange: (date: Date) => void;
  /** Locale để format ngày */
  locale: SupportedLocale;
  /** Ngày tối thiểu có thể chọn */
  minDate?: Date;
  /** Ngày tối đa có thể chọn */
  maxDate?: Date;
  /** Children components */
  children: React.ReactNode;
  /** Có bật swipe không (mặc định: true) */
  enableSwipe?: boolean;
}

// ============================================
// Utilities
// ============================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ============================================
// SwipeDayNavigator Component
// ============================================

export function SwipeDayNavigator({
  currentDate,
  onDateChange,
  locale,
  minDate,
  maxDate,
  children,
  enableSwipe = true,
}: SwipeDayNavigatorProps) {
  const t = useTranslations("common");

  const canGoPrevious = !minDate || addDays(currentDate, -1) >= minDate;
  const canGoNext = !maxDate || addDays(currentDate, 1) <= maxDate;

  const handlePreviousDay = React.useCallback(() => {
    if (canGoPrevious) {
      onDateChange(addDays(currentDate, -1));
    }
  }, [currentDate, canGoPrevious, onDateChange]);

  const handleNextDay = React.useCallback(() => {
    if (canGoNext) {
      onDateChange(addDays(currentDate, 1));
    }
  }, [currentDate, canGoNext, onDateChange]);

  // Swipe: trái = ngày tiếp theo, phải = ngày trước
  const { ref, isSwiping } = useSwipeNavigation({
    enabled: enableSwipe,
    threshold: 50,
    maxTime: 300,
    onSwipeLeft: handleNextDay,
    onSwipeRight: handlePreviousDay,
  });

  const isToday = isSameDay(currentDate, new Date());

  return (
    <div className="space-y-3">
      {/* Navigation header */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
          disabled={!canGoPrevious}
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation active:scale-95 transition-transform"
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex-1 text-center">
          <p className="text-sm sm:text-base font-medium">
            {formatDate(currentDate, locale)}
          </p>
          {isToday && (
            <p className="text-xs text-muted-foreground">{t("today")}</p>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          disabled={!canGoNext}
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation active:scale-95 transition-transform"
          aria-label={t("next")}
        >
          <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Swipe hint - chỉ hiển thị trên mobile */}
      <p className="text-xs text-center text-muted-foreground sm:hidden">
        ← {t("swipeToNavigate")} →
      </p>

      {/* Content với swipe support */}
      <div
        ref={ref}
        className={`transition-opacity ${isSwiping ? "opacity-75" : "opacity-100"}`}
      >
        {children}
      </div>
    </div>
  );
}

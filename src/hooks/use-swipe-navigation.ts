"use client";

import * as React from "react";

// ============================================
// Types
// ============================================

interface SwipeConfig {
  /** Khoảng cách tối thiểu để trigger swipe (px) */
  threshold?: number;
  /** Thời gian tối đa để hoàn thành swipe (ms) */
  maxTime?: number;
  /** Callback khi swipe sang trái */
  onSwipeLeft?: () => void;
  /** Callback khi swipe sang phải */
  onSwipeRight?: () => void;
  /** Callback khi swipe lên */
  onSwipeUp?: () => void;
  /** Callback khi swipe xuống */
  onSwipeDown?: () => void;
  /** Có bật swipe không */
  enabled?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  isSwiping: boolean;
}

interface UseSwipeNavigationReturn {
  /** Ref để gắn vào element cần swipe */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Trạng thái đang swipe */
  isSwiping: boolean;
}

// ============================================
// Hook
// ============================================

/**
 * Custom hook để xử lý swipe gestures cho navigation
 * Hỗ trợ swipe trái/phải/lên/xuống với touch events
 */
export function useSwipeNavigation(
  config: SwipeConfig,
): UseSwipeNavigationReturn {
  const {
    threshold = 50,
    maxTime = 300,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enabled = true,
  } = config;

  const ref = React.useRef<HTMLDivElement>(null);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const swipeState = React.useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isSwiping: false,
  });

  React.useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      swipeState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isSwiping: true,
      };
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.current.isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;

      // Nếu swipe ngang nhiều hơn dọc, prevent scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swipeState.current.isSwiping) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;
      const deltaTime = Date.now() - swipeState.current.startTime;

      // Reset state
      swipeState.current.isSwiping = false;
      setIsSwiping(false);

      // Kiểm tra điều kiện swipe
      if (deltaTime > maxTime) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Swipe ngang
      if (absX > absY && absX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        return;
      }

      // Swipe dọc
      if (absY > absX && absY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    };

    const handleTouchCancel = () => {
      swipeState.current.isSwiping = false;
      setIsSwiping(false);
    };

    // Thêm event listeners
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    enabled,
    threshold,
    maxTime,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  ]);

  return { ref, isSwiping };
}

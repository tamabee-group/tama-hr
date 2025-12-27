"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";

/**
 * Breakpoints theo Tailwind CSS
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

interface BreakpointState {
  isMobile: boolean; // < 640px
  isSm: boolean; // >= 640px
  isMd: boolean; // >= 768px
  isLg: boolean; // >= 1024px
  isXl: boolean; // >= 1280px
  is2xl: boolean; // >= 1536px
  breakpoint: Breakpoint | "xs";
}

/**
 * Hook kiểm tra breakpoint hiện tại của màn hình
 * @client-only
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isMobile: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
    breakpoint: "xs",
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      // Xác định breakpoint hiện tại
      let breakpoint: Breakpoint | "xs" = "xs";
      if (width >= BREAKPOINTS["2xl"]) breakpoint = "2xl";
      else if (width >= BREAKPOINTS.xl) breakpoint = "xl";
      else if (width >= BREAKPOINTS.lg) breakpoint = "lg";
      else if (width >= BREAKPOINTS.md) breakpoint = "md";
      else if (width >= BREAKPOINTS.sm) breakpoint = "sm";

      setState({
        isMobile: width < BREAKPOINTS.sm,
        isSm: width >= BREAKPOINTS.sm,
        isMd: width >= BREAKPOINTS.md,
        isLg: width >= BREAKPOINTS.lg,
        isXl: width >= BREAKPOINTS.xl,
        is2xl: width >= BREAKPOINTS["2xl"],
        breakpoint,
      });
    };

    // Chạy lần đầu
    updateBreakpoint();

    // Lắng nghe resize
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return state;
}

/**
 * Hook kiểm tra một breakpoint cụ thể
 * @param query - Media query string (vd: "(min-width: 768px)")
 * @client-only
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = React.useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = React.useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

/**
 * Hook kiểm tra thiết bị có hỗ trợ touch không
 * Default true để mobile-first, tránh hydration mismatch
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    };
    checkTouch();
  }, []);

  return isTouch;
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

// Context để share isTouch state
const TouchContext = React.createContext(false);

function Tooltip({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const isTouch = useIsTouchDevice();

  // Mobile: dùng Popover (click to open)
  if (isTouch) {
    return (
      <TouchContext.Provider value={true}>
        <PopoverPrimitive.Root data-slot="tooltip" {...props}>
          {children}
        </PopoverPrimitive.Root>
      </TouchContext.Provider>
    );
  }

  // Desktop: dùng Tooltip (hover)
  return (
    <TouchContext.Provider value={false}>
      <TooltipProvider>
        <TooltipPrimitive.Root data-slot="tooltip" {...props}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipProvider>
    </TouchContext.Provider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const isTouch = React.useContext(TouchContext);

  if (isTouch) {
    return <PopoverPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
  }

  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const isTouch = React.useContext(TouchContext);

  // Mobile: Popover content
  if (isTouch) {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-popover-content-transform-origin) rounded-md border px-3 py-1.5 text-xs shadow-md",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }

  // Desktop: Tooltip content
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

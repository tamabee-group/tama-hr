"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type DetailDialogSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  size?: DetailDialogSize;
  // Footer actions
  footer?: ReactNode;
  // Custom close button text
  closeText?: string;
  // Show close button in footer
  showFooterClose?: boolean;
}

const sizeClasses: Record<DetailDialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-4xl",
};

export function DetailDialog({
  open,
  onOpenChange,
  title,
  children,
  size = "lg",
  footer,
  closeText,
  showFooterClose = true,
}: DetailDialogProps) {
  const tCommon = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 flex flex-col max-h-[90vh]",
          sizeClasses[size],
        )}
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold pr-8">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{tCommon("close")}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6 pt-4">{children}</div>
        </ScrollArea>

        {/* Footer */}
        {(footer || showFooterClose) && (
          <div className="p-4 sm:p-6 pt-4 border-t shrink-0">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
              {showFooterClose && (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {closeText || tCommon("close")}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Sub-components cho việc tổ chức nội dung trong DetailDialog
export interface DetailSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      {children}
    </div>
  );
}

export interface DetailRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4",
        className,
      )}
    >
      <span className="text-sm text-muted-foreground sm:w-1/3 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium sm:flex-1">{value}</span>
    </div>
  );
}

export interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function DetailGrid({
  children,
  columns = 2,
  className,
}: DetailGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface DetailItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

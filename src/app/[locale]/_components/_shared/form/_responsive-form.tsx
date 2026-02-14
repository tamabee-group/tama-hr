"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ResponsiveFormProps {
  children: React.ReactNode;
  /** Callback khi submit form */
  onSubmit?: (e: React.FormEvent) => void;
  /** Custom class cho form */
  className?: string;
}

interface ResponsiveFormRowProps {
  children: React.ReactNode;
  /** Số cột trên desktop (default: 2) */
  columns?: 1 | 2 | 3 | 4;
  /** Custom class */
  className?: string;
}

interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  /** Label cho field */
  label?: string;
  /** Field là required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Span full width */
  fullWidth?: boolean;
  /** Custom class */
  className?: string;
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  /** Alignment (default: end) */
  align?: "start" | "center" | "end" | "between";
  /** Custom class */
  className?: string;
}

// ============================================
// ResponsiveForm Component
// ============================================

/**
 * Responsive form container
 * - Vertical stacking trên mobile
 * - Full-width inputs trên mobile
 */
export function ResponsiveForm({
  children,
  onSubmit,
  className,
}: ResponsiveFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 sm:space-y-6", className)}
    >
      {children}
    </form>
  );
}

// ============================================
// ResponsiveFormRow Component
// ============================================

/**
 * Form row với responsive grid
 * - Stack vertically trên mobile
 * - Grid columns trên desktop
 */
export function ResponsiveFormRow({
  children,
  columns = 2,
  className,
}: ResponsiveFormRowProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:gap-4",
        gridClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// ResponsiveFormField Component
// ============================================

/**
 * Form field wrapper với label, error, helper text
 * - Full width trên mobile
 * - Proper spacing và typography
 */
export function ResponsiveFormField({
  children,
  label,
  required,
  error,
  helperText,
  fullWidth,
  className,
}: ResponsiveFormFieldProps) {
  return (
    <div
      className={cn("space-y-1.5", fullWidth && "sm:col-span-full", className)}
    >
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {/* Input wrapper - đảm bảo full width */}
      <div className="*:w-full">{children}</div>
      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {/* Error message */}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================
// ResponsiveFormActions Component
// ============================================

/**
 * Form actions container (buttons)
 * - Stack vertically trên mobile
 * - Horizontal trên desktop
 */
export function ResponsiveFormActions({
  children,
  align = "end",
  className,
}: ResponsiveFormActionsProps) {
  const alignClasses = {
    start: "sm:justify-start",
    center: "sm:justify-center",
    end: "sm:justify-end",
    between: "sm:justify-between",
  };

  return (
    <div
      className={cn(
        // Mobile: stack vertically, full width buttons
        "flex flex-col-reverse gap-2",
        // Desktop: horizontal layout
        "sm:flex-row sm:gap-3",
        alignClasses[align],
        // Buttons full width trên mobile
        "[&>button]:w-full [&>button]:sm:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// ResponsiveFormSection Component
// ============================================

interface ResponsiveFormSectionProps {
  children: React.ReactNode;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Custom class */
  className?: string;
}

/**
 * Form section với title và description
 */
export function ResponsiveFormSection({
  children,
  title,
  description,
  className,
}: ResponsiveFormSectionProps) {
  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base sm:text-lg font-medium">{title}</h3>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FallbackImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  /** Compact mode: chỉ hiển thị icon nhỏ (dùng cho table) */
  compact?: boolean;
  onClick?: () => void;
  onLoadStatusChange?: (isLoaded: boolean) => void;
}

/**
 * Internal component để handle image loading
 */
function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  compact,
  onClick,
  onLoadStatusChange,
}: Omit<FallbackImageProps, "src"> & { src: string }) {
  const [hasError, setHasError] = useState(false);

  // Notify parent về trạng thái load
  useEffect(() => {
    onLoadStatusChange?.(!hasError);
  }, [hasError, onLoadStatusChange]);

  if (hasError) {
    return (
      <FallbackPlaceholder
        className={fallbackClassName || className}
        compact={compact}
        onClick={onClick}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      onClick={onClick}
    />
  );
}

/**
 * Fallback placeholder component
 */
function FallbackPlaceholder({
  className,
  compact,
  onClick,
}: {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}) {
  const t = useTranslations("common");

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50 text-muted-foreground rounded",
          className,
        )}
        onClick={onClick}
      >
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg",
        className,
      )}
      onClick={onClick}
    >
      <div className="p-3 bg-muted rounded-full">
        <ImageOff className="h-10 w-10" />
      </div>
      <span className="text-sm font-medium">{t("noImage")}</span>
    </div>
  );
}

/**
 * Component Image với fallback khi ảnh không load được
 * - compact=true: chỉ icon nhỏ (cho table)
 * - compact=false: icon lớn + text (cho dialog)
 * @client-only
 */
export function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  compact = false,
  onClick,
  onLoadStatusChange,
}: FallbackImageProps) {
  // Notify parent khi không có src
  useEffect(() => {
    if (!src) {
      onLoadStatusChange?.(false);
    }
  }, [src, onLoadStatusChange]);

  if (!src) {
    return (
      <FallbackPlaceholder
        className={fallbackClassName || className}
        compact={compact}
        onClick={onClick}
      />
    );
  }

  // Dùng key={src} để reset state khi src thay đổi
  return (
    <ImageWithFallback
      key={src}
      src={src}
      alt={alt}
      className={className}
      fallbackClassName={fallbackClassName}
      compact={compact}
      onClick={onClick}
      onLoadStatusChange={onLoadStatusChange}
    />
  );
}

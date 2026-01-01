"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";

// Kích thước file tối đa mặc định (5MB)
const DEFAULT_MAX_SIZE_MB = 5;
// Định dạng file được chấp nhận mặc định
const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  maxSize?: number; // MB, default 5
  accept?: string[]; // Default: ['image/jpeg', 'image/png', 'image/webp']
  disabled?: boolean;
  className?: string;
  error?: string;
}

// Hàm validate file size - export để test
export function validateFileSize(
  fileSize: number,
  maxSizeMB: number,
  errorMessage: string,
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: errorMessage,
    };
  }
  return { valid: true };
}

// Hàm validate file type - export để test
export function validateFileType(
  fileType: string,
  acceptedTypes: string[],
  errorMessage: string,
): { valid: boolean; error?: string } {
  if (!acceptedTypes.includes(fileType)) {
    return {
      valid: false,
      error: errorMessage,
    };
  }
  return { valid: true };
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  maxSize = DEFAULT_MAX_SIZE_MB,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  className,
  error: externalError,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("imageUpload");

  // Xử lý file được chọn
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      const acceptedFormats = accept
        .map((type) => type.split("/")[1])
        .join(", ");
      const typeValidation = validateFileType(
        file.type,
        accept,
        t("invalidFormat", { formats: acceptedFormats }),
      );
      if (!typeValidation.valid) {
        setError(typeValidation.error || t("invalidFile"));
        return;
      }

      // Validate file size
      const sizeValidation = validateFileSize(
        file.size,
        maxSize,
        t("fileTooLarge", { maxSize }),
      );
      if (!sizeValidation.valid) {
        setError(sizeValidation.error || t("fileTooLargeGeneric"));
        return;
      }

      setIsLoading(true);

      try {
        // Compress ảnh sang WebP để giảm dung lượng
        const compressedFile = await compressImageToWebP(file);

        // Tạo preview URL
        const objectUrl = URL.createObjectURL(compressedFile);
        setPreviewUrl(objectUrl);

        // Gọi callback với file đã compress
        if (onFileSelect) {
          onFileSelect(compressedFile);
        }

        // Gọi onChange với URL preview
        onChange(objectUrl);
      } catch {
        setError(t("processError"));
      } finally {
        setIsLoading(false);
      }
    },
    [accept, maxSize, onChange, onFileSelect, t],
  );

  // Xử lý khi chọn file từ input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  // Xử lý drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Xóa ảnh đã chọn
  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    onChange("");
  };

  // Click để mở file picker
  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const displayError = externalError || error;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          isDragging && !disabled && "border-primary bg-primary/5",
          !isDragging && !displayError && "border-muted-foreground/25",
          displayError && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !previewUrl && "cursor-pointer hover:border-primary/50",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!previewUrl ? handleClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("processing")}
            </p>
          </div>
        ) : previewUrl ? (
          <div className="relative p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-md object-contain"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="rounded-full bg-muted p-3 mb-3">
              {isDragging ? (
                <ImageIcon className="h-6 w-6 text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? t("dropHere") : t("dragOrClick")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accept
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              • {t("maxSize", { maxSize })}
            </p>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

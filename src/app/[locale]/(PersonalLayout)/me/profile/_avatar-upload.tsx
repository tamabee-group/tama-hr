"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageCropDialog } from "@/app/[locale]/_components/image";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { getFileUrl } from "@/lib/utils/file-url";
import { Spinner } from "@/components/ui/spinner";

// ============================================
// Types
// ============================================

interface AvatarUploadProps {
  /** URL của avatar hiện tại */
  currentAvatar?: string;
  /** Callback khi avatar được thay đổi (sau khi crop và compress) */
  onAvatarChange: (file: File) => void;
  /** Disable upload */
  disabled?: boolean;
  /** Tên người dùng để hiển thị fallback */
  userName?: string;
  /** Key để force refresh avatar image */
  avatarKey?: number;
  /** Custom className */
  className?: string;
}

// ============================================
// Glass Styles
// ============================================

const glassOverlayStyles = [
  "absolute",
  "inset-0",
  "flex",
  "items-center",
  "justify-center",
  "rounded-full",
  // Glass effect
  "backdrop-blur-sm",
  "bg-black/40",
  // Transition
  "opacity-0",
  "group-hover:opacity-100",
  "transition-opacity",
  "duration-200",
];

// ============================================
// Main Component
// ============================================

/**
 * AvatarUpload Component
 * Component upload avatar với tính năng crop và compress sang WebP
 *
 * Features:
 * - Hiển thị avatar hiện tại hoặc placeholder
 * - Click để mở file picker
 * - Sau khi chọn ảnh, mở ImageCropDialog để crop
 * - Sau khi crop, compress sang WebP format
 * - Gọi callback onAvatarChange với file đã compress
 * - Hiển thị loading state trong quá trình xử lý
 */
export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  disabled = false,
  userName,
  avatarKey = 0,
  className,
}: AvatarUploadProps) {
  const t = useTranslations("portal");

  // State
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [cropDialogOpen, setCropDialogOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ============================================
  // Handlers
  // ============================================

  /**
   * Xử lý click vào avatar để mở file picker
   */
  const handleAvatarClick = React.useCallback(() => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  }, [disabled, isProcessing]);

  /**
   * Xử lý khi chọn file từ input
   */
  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Đọc file và hiển thị dialog crop
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);

      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  /**
   * Xử lý sau khi crop xong
   * Compress ảnh sang WebP và gọi callback
   */
  const handleCropComplete = React.useCallback(
    async (croppedFile: File) => {
      setIsProcessing(true);
      try {
        // Compress ảnh sang WebP
        const compressedFile = await compressImageToWebP(croppedFile);
        // Gọi callback với file đã compress
        onAvatarChange(compressedFile);
      } catch (error) {
        console.error("Lỗi khi xử lý ảnh:", error);
      } finally {
        setIsProcessing(false);
        setSelectedImage(null);
      }
    },
    [onAvatarChange],
  );

  /**
   * Xử lý khi đóng dialog crop
   */
  const handleCropDialogClose = React.useCallback((open: boolean) => {
    setCropDialogOpen(open);
    if (!open) {
      setSelectedImage(null);
    }
  }, []);

  // ============================================
  // Render
  // ============================================

  // Lấy chữ cái đầu của tên để hiển thị fallback
  const fallbackChar = userName?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      {/* Avatar với overlay upload */}
      <div
        className={cn(
          "relative group cursor-pointer",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        onClick={handleAvatarClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAvatarClick();
          }
        }}
        aria-label={t("profile.fields.avatar")}
        aria-disabled={disabled}
      >
        <Avatar className="h-24 w-24 md:h-28 md:w-28">
          {currentAvatar && (
            <AvatarImage
              src={`${getFileUrl(currentAvatar)}?v=${avatarKey}`}
              alt={userName || "Avatar"}
            />
          )}
          <AvatarFallback className="text-2xl md:text-3xl">
            {fallbackChar}
          </AvatarFallback>
        </Avatar>

        {/* Overlay khi hover - hiển thị icon camera hoặc spinner */}
        <div className={cn(glassOverlayStyles)}>
          {isProcessing ? (
            <Spinner className="h-6 w-6 text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
        aria-hidden="true"
      />

      {/* Dialog crop ảnh */}
      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={handleCropDialogClose}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </>
  );
}

// ============================================
// Exports
// ============================================

export type { AvatarUploadProps };

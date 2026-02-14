"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FallbackImage } from "@/app/[locale]/_components/image";

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
}

/**
 * Modal hiển thị ảnh full size
 * - Hiển thị ảnh chứng minh chuyển khoản
 * - Hỗ trợ download ảnh (chỉ khi ảnh load thành công)
 */
export function ImageModal({
  open,
  onOpenChange,
  imageUrl,
  title,
}: ImageModalProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const defaultTitle = t("table.transferProof");

  const handleDownload = () => {
    if (!imageUrl || !isImageLoaded) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `transfer-proof-${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadStatusChange = useCallback((loaded: boolean) => {
    setIsImageLoaded(loaded);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center p-4 bg-muted rounded-lg min-h-[200px]">
          <FallbackImage
            src={imageUrl}
            alt={title || defaultTitle}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
            fallbackClassName="w-32 h-32 rounded-lg"
            onLoadStatusChange={handleLoadStatusChange}
          />
        </div>

        {isImageLoaded && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {tCommon("download")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

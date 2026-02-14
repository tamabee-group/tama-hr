"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, X, ZoomIn, ZoomOut, RotateCw, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmployeeDocument } from "@/types/employee-detail";
import { isImageFile, isPdfFile } from "@/types/employee-portal";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

// ============================================
// Types
// ============================================

interface DocumentPreviewProps {
  document: EmployeeDocument | null;
  open: boolean;
  onClose: () => void;
}

// ============================================
// Helpers
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// ============================================
// Component
// ============================================

export function DocumentPreview({
  document,
  open,
  onClose,
}: DocumentPreviewProps) {
  const t = useTranslations("portal.documents");
  const tEnums = useTranslations("enums");

  // State cho image zoom
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Reset state khi document thay đổi
  React.useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [document]);

  if (!document) return null;

  const isImage = isImageFile(document.fileType);
  const isPdf = isPdfFile(document.fileType);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Download handler
  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.target = "_blank";
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold">
                {document.fileName}
              </DialogTitle>
              <Badge variant="outline" className="text-xs">
                {getEnumLabel("documentType", document.documentType, tEnums)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>{formatDate(document.createdAt)}</span>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="relative flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          {isImage ? (
            // Image preview với zoom
            <div className="flex min-h-[400px] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.fileUrl}
                alt={document.fileName}
                className="max-h-[60vh] transition-transform duration-200"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          ) : isPdf ? (
            // PDF preview (iframe)
            <iframe
              src={document.fileUrl}
              className="h-[60vh] w-full"
              title={document.fileName}
            />
          ) : (
            // Unsupported file type
            <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
              <FileText className="mb-4 h-16 w-16 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("previewNotAvailable")}
              </p>
            </div>
          )}
        </div>

        {/* Footer với controls */}
        <div className="flex items-center justify-between border-t p-4">
          {/* Image controls */}
          {isImage && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                aria-label={t("zoomOut")}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[60px] text-center text-sm text-gray-500">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                aria-label={t("zoomIn")}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRotate}
                aria-label={t("rotate")}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Spacer nếu không phải image */}
          {!isImage && <div />}

          {/* Download button */}
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t("download")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { DocumentPreviewProps };

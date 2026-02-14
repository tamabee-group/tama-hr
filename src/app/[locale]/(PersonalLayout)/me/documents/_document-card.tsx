"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeDocument } from "@/types/employee-detail";
import { isImageFile, isPdfFile } from "@/types/employee-portal";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface DocumentCardProps {
  document: EmployeeDocument;
  onClick: () => void;
  onDelete: () => void;
}

// ============================================
// Helpers
// ============================================

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Document type badge colors
const documentTypeBadgeColors: Record<string, string> = {
  CONTRACT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  ID_CARD:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  CERTIFICATE:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  RESUME:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

// ============================================
// Component
// ============================================

export function DocumentCard({
  document,
  onClick,
  onDelete,
}: DocumentCardProps) {
  const t = useTranslations("portal.documents");
  const tEnums = useTranslations("enums");

  const isImage = isImageFile(document.fileType);
  const isPdf = isPdfFile(document.fileType);

  // Xử lý click delete (ngăn event bubbling)
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <GlassCard
      variant="interactive"
      className="group relative overflow-hidden p-0"
      onClick={onClick}
    >
      {/* Thumbnail / Icon */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.fileUrl}
            alt={document.fileName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isPdf ? (
              <FileText className="h-16 w-16 text-red-500" />
            ) : (
              <FileText className="h-16 w-16 text-gray-400" />
            )}
          </div>
        )}

        {/* Delete button overlay */}
        <Button
          variant="destructive"
          size="icon"
          className={cn(
            "absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity",
            "group-hover:opacity-100",
            "focus:opacity-100",
          )}
          onClick={handleDeleteClick}
          aria-label={t("delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* File type indicator */}
        <div className="absolute bottom-2 left-2">
          {isImage ? (
            <div className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm dark:bg-black/50">
              <ImageIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
          ) : isPdf ? (
            <div className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm dark:bg-black/50">
              <FileText className="h-4 w-4 text-red-500" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Document Info */}
      <div className="p-3">
        {/* Document Type Badge */}
        <Badge
          className={cn(
            "mb-2 border-0 text-xs",
            documentTypeBadgeColors[document.documentType] ||
              documentTypeBadgeColors.OTHER,
          )}
        >
          {getEnumLabel("documentType", document.documentType, tEnums)}
        </Badge>

        {/* File Name */}
        <p
          className="truncate text-sm font-medium text-gray-900 dark:text-white"
          title={document.fileName}
        >
          {document.fileName}
        </p>

        {/* File Size & Date */}
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>{formatDate(document.createdAt)}</span>
        </div>
      </div>
    </GlassCard>
  );
}

export type { DocumentCardProps };

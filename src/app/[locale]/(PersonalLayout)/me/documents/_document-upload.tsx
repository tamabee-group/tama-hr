"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Upload, X, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { EmployeeDocument, DocumentType } from "@/types/employee-detail";
import {
  ACCEPTED_FILE_TYPES,
  isImageFile,
  isPdfFile,
} from "@/types/employee-portal";
import { uploadDocument } from "@/lib/apis/my-document-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: (doc: EmployeeDocument) => void;
}

// ============================================
// Constants
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DOCUMENT_TYPES: DocumentType[] = [
  "ID_CARD",
  "CERTIFICATE",
  "RESUME",
  "OTHER",
];

// ============================================
// Component
// ============================================

export function DocumentUpload({
  open,
  onClose,
  onUploadComplete,
}: DocumentUploadProps) {
  const t = useTranslations("portal.documents");
  const tEnums = useTranslations("enums");

  // State
  const [file, setFile] = React.useState<File | null>(null);
  const [documentType, setDocumentType] = React.useState<DocumentType>("OTHER");
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state khi đóng dialog
  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setDocumentType("OTHER");
      setProgress(0);
      setError(null);
    }
  }, [open]);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (
      !ACCEPTED_FILE_TYPES.includes(
        file.type as (typeof ACCEPTED_FILE_TYPES)[number],
      )
    ) {
      return t("invalidFileType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("fileTooLarge");
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      // Simulate progress (vì không có real progress từ API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadedDoc = await uploadDocument(file, documentType);

      clearInterval(progressInterval);
      setProgress(100);

      toast.success(t("uploadSuccess"));
      onUploadComplete(uploadedDoc);
      onClose();
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // File preview
  const renderFilePreview = () => {
    if (!file) return null;

    const isImage = isImageFile(file.type);
    const isPdf = isPdfFile(file.type);

    return (
      <div className="relative mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Preview icon/image */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : isPdf ? (
              <FileText className="h-8 w-8 text-red-500" />
            ) : (
              <FileText className="h-8 w-8 text-gray-400" />
            )}
          </div>

          {/* File info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleRemoveFile}
            disabled={uploading}
            aria-label={t("removeFile")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("uploading")} {progress}%
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <span>{t("upload")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label>{t("documentType")}</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getEnumLabel("documentType", type, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop Zone */}
          {!file && (
            <div
              className={cn(
                "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-600",
                "hover:border-primary hover:bg-primary/5",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFileInputChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={uploading}
                aria-label={t("selectFile")}
              />

              <div className="flex flex-col items-center">
                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("dropzone")}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("acceptedTypes")}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* File Preview */}
          {renderFilePreview()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("uploading")}
              </>
            ) : (
              t("uploadButton")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { DocumentUploadProps };

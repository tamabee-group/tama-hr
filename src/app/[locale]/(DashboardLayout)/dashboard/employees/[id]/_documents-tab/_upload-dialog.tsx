"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/employee-detail";
import { uploadEmployeeDocument } from "@/lib/apis/employee-detail-api";
import { formatFileSize } from "@/lib/utils/format-file-size";

interface UploadDialogProps {
  employeeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Allowed file types
const ALLOWED_TYPES = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "xls",
  "xlsx",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDialog({
  employeeId,
  open,
  onOpenChange,
  onSuccess,
}: UploadDialogProps) {
  const t = useTranslations("employeeDetail.documents");
  const tDocTypes = useTranslations("employeeDetail.documentTypes");
  const tCommon = useTranslations("common");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>(DocumentType.OTHER);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_TYPES.includes(extension)) {
      return t("invalidFileType");
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t("fileTooLarge");
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await uploadEmployeeDocument(employeeId, selectedFile, documentType);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(tCommon("errorSaving"));
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when closing
  const handleClose = () => {
    setSelectedFile(null);
    setDocumentType(DocumentType.OTHER);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("uploadNew")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("uploadNew")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document type selector */}
          <div className="space-y-2">
            <Label>{tCommon("type")}</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DocumentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {tDocTypes(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              error
                ? "border-destructive bg-destructive/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ALLOWED_TYPES.map((t) => `.${t}`).join(",")}
              onChange={handleFileSelect}
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("dropOrClick")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("allowedTypes")}: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("maxSize")}: 10MB
                </p>
              </>
            )}
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? tCommon("uploading") : t("uploadNew")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

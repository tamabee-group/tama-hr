"use client";

import { useTranslations } from "next-intl";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
} from "lucide-react";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmployeeDocument } from "@/types/employee-detail";
import { formatDate } from "@/lib/utils/format-date-time";
import { formatFileSize } from "@/lib/utils/format-file-size";

interface DocumentGridProps {
  documents: EmployeeDocument[];
  onDelete: (documentId: number) => void;
}

// Lấy icon theo file type
function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type === "pdf") return FileText;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) return FileImage;
  if (["xls", "xlsx", "csv"].includes(type)) return FileSpreadsheet;
  if (["doc", "docx"].includes(type)) return FileText;
  return File;
}

// Lấy màu icon theo file type
function getFileIconColor(fileType: string) {
  const type = fileType.toLowerCase();
  if (type === "pdf") return "text-red-500";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(type))
    return "text-blue-500";
  if (["xls", "xlsx", "csv"].includes(type)) return "text-green-500";
  if (["doc", "docx"].includes(type)) return "text-blue-600";
  return "text-gray-500";
}

export function DocumentGrid({ documents, onDelete }: DocumentGridProps) {
  const t = useTranslations("employeeDetail.documents");
  const tDocTypes = useTranslations("employeeDetail.documentTypes");
  const tCommon = useTranslations("common");

  const handleView = (doc: EmployeeDocument) => {
    window.open(doc.fileUrl, "_blank");
  };

  const handleDownload = (doc: EmployeeDocument) => {
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.click();
  };

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => {
        const FileIcon = getFileIcon(doc.fileType);
        const iconColor = getFileIconColor(doc.fileType);

        return (
          <GlassCard
            key={doc.id}
            className="py-2 px-3 group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleView(doc)}
          >
            <div className="flex items-start gap-3">
              {/* File icon */}
              <div className="shrink-0 p-2 bg-muted rounded-lg">
                <FileIcon className={`h-8 w-8 ${iconColor}`} />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-sm truncate"
                  title={doc.fileName}
                >
                  {doc.fileName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(doc.createdAt)} • {formatFileSize(doc.fileSize)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tDocTypes(doc.documentType)}
                </p>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(doc);
                  }}
                  title={t("download")}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                      title={t("delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{tCommon("confirm")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("confirmDelete")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(doc.id)}>
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

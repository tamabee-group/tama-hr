"use client";

import { useTranslations } from "next-intl";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDate } from "@/lib/utils/format-date";
import { formatFileSize } from "@/lib/utils/format-file-size";

interface DocumentListProps {
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

export function DocumentList({ documents, onDelete }: DocumentListProps) {
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">STT</TableHead>
            <TableHead>{tCommon("fileName")}</TableHead>
            <TableHead>{tCommon("type")}</TableHead>
            <TableHead>{tCommon("size")}</TableHead>
            <TableHead>{tCommon("createdAt")}</TableHead>
            <TableHead className="text-right">{tCommon("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc, index) => {
            const FileIcon = getFileIcon(doc.fileType);
            const iconColor = getFileIconColor(doc.fileType);

            return (
              <TableRow key={doc.id}>
                <TableCell className="text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon className={`h-5 w-5 ${iconColor}`} />
                    <span
                      className="truncate max-w-[200px]"
                      title={doc.fileName}
                    >
                      {doc.fileName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{tDocTypes(doc.documentType)}</TableCell>
                <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                <TableCell>{formatDate(doc.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(doc)}
                      title={t("view")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      title={t("download")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {tCommon("confirm")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("confirmDelete")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {tCommon("cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(doc.id)}>
                            {t("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

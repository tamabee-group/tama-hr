"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { DocumentGrid } from "./_document-grid";
import { DocumentUpload } from "./_document-upload";
import { DocumentPreview } from "./_document-preview";
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
} from "@/components/ui/alert-dialog";
import { EmployeeDocument } from "@/types/employee-detail";
import { getMyDocuments, deleteDocument } from "@/lib/apis/my-document-api";
import { toast } from "sonner";

// ============================================
// Component
// ============================================

export function DocumentsContent() {
  const t = useTranslations("portal.documents");

  // State
  const [documents, setDocuments] = React.useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [previewDocument, setPreviewDocument] =
    React.useState<EmployeeDocument | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<EmployeeDocument | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Fetch documents
  const fetchDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyDocuments(0, 100);
      setDocuments(response.content);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handlers
  const handleDocumentClick = (doc: EmployeeDocument) => {
    setPreviewDocument(doc);
  };

  const handleDocumentDelete = (doc: EmployeeDocument) => {
    setDeleteTarget(doc);
  };

  const handleUploadComplete = (doc: EmployeeDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header với Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("totalDocuments", { count: documents.length })}
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("upload")}
        </Button>
      </div>

      {/* Document Grid */}
      <DocumentGrid
        documents={documents}
        loading={loading}
        onDocumentClick={handleDocumentClick}
        onDocumentDelete={handleDocumentDelete}
      />

      {/* Upload Dialog */}
      <DocumentUpload
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* Preview Dialog */}
      <DocumentPreview
        document={previewDocument}
        open={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDescription", {
                name: deleteTarget?.fileName || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

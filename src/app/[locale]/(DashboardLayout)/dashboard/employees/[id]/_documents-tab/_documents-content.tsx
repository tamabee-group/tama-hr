"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Grid3X3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeDocument, DocumentType } from "@/types/employee-detail";
import {
  getEmployeeDocuments,
  deleteEmployeeDocument,
} from "@/lib/apis/employee-detail-api";
import { DocumentGrid } from "./_document-grid";
import { DocumentList } from "./_document-list";
import { UploadDialog } from "./_upload-dialog";

interface DocumentsContentProps {
  employeeId: number;
}

type ViewMode = "grid" | "list";

export function DocumentsContent({ employeeId }: DocumentsContentProps) {
  const t = useTranslations("employeeDetail.documents");
  const tDocTypes = useTranslations("employeeDetail.documentTypes");
  const tCommon = useTranslations("common");

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeDocuments(employeeId, page, pageSize);
      setDocuments(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, page, tCommon]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter documents by type
  const filteredDocuments =
    filterType === "all"
      ? documents
      : documents.filter((doc) => doc.documentType === filterType);

  // Handle delete
  const handleDelete = async (documentId: number) => {
    try {
      await deleteEmployeeDocument(employeeId, documentId);
      toast.success(t("deleteSuccess"));
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(tCommon("errorDeleting"));
    }
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    fetchDocuments();
    toast.success(t("uploadSuccess"));
  };

  if (isLoading) {
    return <DocumentsSkeleton viewMode={viewMode} />;
  }

  return (
    <div className="space-y-6">
      {/* Header với filters và actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Filter by type */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {tDocTypes(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Upload button */}
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("uploadNew")}
        </Button>
      </div>

      {/* Documents display */}
      {filteredDocuments.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-muted-foreground">{t("noDocuments")}</p>
        </GlassCard>
      ) : viewMode === "grid" ? (
        <DocumentGrid documents={filteredDocuments} onDelete={handleDelete} />
      ) : (
        <DocumentList documents={filteredDocuments} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {tCommon("previous")}
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            {tCommon("next")}
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        employeeId={employeeId}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

function DocumentsSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      {viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}
    </div>
  );
}

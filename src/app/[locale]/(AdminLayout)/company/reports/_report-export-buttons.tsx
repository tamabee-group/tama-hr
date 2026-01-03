"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCsv, exportPdf, ReportType } from "@/lib/apis/report-api";
import { ReportFilters } from "@/types/attendance-records";

interface ReportExportButtonsProps {
  reportType: ReportType;
  filters: ReportFilters;
  disabled?: boolean;
}

/**
 * Component buttons xuất báo cáo CSV/PDF
 * Có thể tái sử dụng cho tất cả các trang báo cáo
 */
export function ReportExportButtons({
  reportType,
  filters,
  disabled = false,
}: ReportExportButtonsProps) {
  const t = useTranslations("reports");
  const [isExporting, setIsExporting] = useState(false);

  // Xuất CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCsv(reportType, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch {
      toast.error(t("messages.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  // Xuất PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await exportPdf(reportType, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch {
      toast.error(t("messages.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? t("actions.exporting") : t("common.export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {t("actions.exportCsv")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPdf} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          {t("actions.exportPdf")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

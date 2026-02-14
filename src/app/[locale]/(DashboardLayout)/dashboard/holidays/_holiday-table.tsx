"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { HolidayFormDialog } from "./_holiday-form";
import { holidayApi } from "@/lib/apis/holiday-api";
import { Holiday } from "@/types/attendance-records";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useAuth } from "@/hooks/use-auth";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 50;

/**
 * Component bảng danh sách ngày nghỉ lễ
 * Hỗ trợ CRUD + sync ngày lễ quốc gia từ Google Calendar
 */
export function HolidayTable() {
  const t = useTranslations("holidays");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const { user } = useAuth();

  // Tên quốc gia dựa trên locale của company
  const companyLocale = user?.locale?.toLowerCase() || "ja";
  const countryName = companyLocale.startsWith("vi")
    ? t("countryVi")
    : t("countryJa");

  const currentYear = new Date().getFullYear();

  // State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(DEFAULT_PAGE);
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString(),
  );

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const year = selectedYear === "all" ? undefined : parseInt(selectedYear);
      const response = await holidayApi.getHolidays(page, DEFAULT_LIMIT, year);
      setHolidays(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, selectedYear, tErrors]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Sync ngày lễ quốc gia từ Google Calendar
  const handleSync = async () => {
    const year = selectedYear === "all" ? currentYear : parseInt(selectedYear);
    try {
      setIsSyncing(true);
      await holidayApi.syncNationalHolidays(year);
      toast.success(t("messages.syncSuccess"));
      fetchHolidays();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddNew = () => {
    setSelectedHoliday(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!holidayToDelete) return;
    try {
      setIsProcessing(true);
      await holidayApi.deleteHoliday(holidayToDelete.id);
      toast.success(t("messages.deleteSuccess"));
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
      fetchHolidays();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setSelectedHoliday(null);
    fetchHolidays();
  };

  // Xóa tất cả ngày nghỉ
  const handleDeleteAllConfirm = async () => {
    try {
      setIsDeletingAll(true);
      await holidayApi.deleteAllHolidays();
      toast.success(t("messages.deleteAllSuccess"));
      setDeleteAllDialogOpen(false);
      fetchHolidays();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Danh sách năm
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Columns
  const columns: ColumnDef<Holiday>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "date",
      header: t("table.date"),
      cell: ({ row }) => formatDateWithDayOfWeek(row.original.date, locale),
    },
    {
      accessorKey: "description",
      header: t("table.description"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("filter.year")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allYears")}</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nút sync ngày lễ quốc gia */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isSyncing ? t("syncing") : t("syncNational")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={holidays.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {tCommon("deleteAll")}
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addHoliday")}
          </Button>
        </div>
      </div>

      {/* Mô tả sync */}
      <p className="text-sm text-muted-foreground">
        {t("syncDescription", { country: countryName })}
      </p>

      {/* Table */}
      <BaseTable
        columns={columns}
        data={holidays}
        showPagination={false}
        noResultsText={t("messages.noHolidays")}
      />

      {/* Form Dialog */}
      <HolidayFormDialog
        holiday={selectedHoliday}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteAllDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAll}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllConfirm}
              disabled={isDeletingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {tCommon("deleteAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

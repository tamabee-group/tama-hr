"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Star,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { WorkSchedule } from "@/types/attendance-records";
import { getSchedules, deleteSchedule } from "@/lib/apis/work-schedule-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatMinutesToTime } from "@/lib/utils/format-date";

type SupportedLocale = "vi" | "en" | "ja";
import { ScheduleForm } from "./_schedule-form";

/**
 * Component hiển thị bảng danh sách lịch làm việc
 * Gọn gàng với 1 bảng duy nhất
 */
export function ScheduleTable() {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WorkSchedule | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch schedules
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSchedules(0, 100);
      setSchedules(response.content);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter schedules by search query
  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const query = searchQuery.toLowerCase();
    return schedules.filter((s) => s.name.toLowerCase().includes(query));
  }, [schedules, searchQuery]);

  // Handle delete
  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule(scheduleToDelete.id);
      toast.success(t("messages.deleteSuccess"));
      fetchData();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSchedule(null);
    fetchData();
  };

  // Columns definition
  const columns: ColumnDef<WorkSchedule>[] = [
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.isDefault && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: t("table.type"),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {getEnumLabel("scheduleType", row.original.type, tEnums)}
        </Badge>
      ),
    },
    {
      id: "workHours",
      header: t("table.workHours"),
      cell: ({ row }) => {
        const start = row.original.scheduleData?.workStartTime || "--:--";
        const end = row.original.scheduleData?.workEndTime || "--:--";
        return `${start} - ${end}`;
      },
    },
    {
      id: "breakTime",
      header: t("table.breakTime"),
      cell: ({ row }) => {
        const minutes = row.original.scheduleData?.breakMinutes;
        if (minutes === undefined || minutes === null) return "--";
        return formatMinutesToTime(minutes, {
          locale: locale as SupportedLocale,
        });
      },
    },
    {
      accessorKey: "assignmentCount",
      header: t("table.assignmentCount"),
      cell: ({ row }) => row.original.assignmentCount || 0,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingSchedule(row.original);
                setShowForm(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setScheduleToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">{tCommon("loading")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Create Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`${tCommon("search")}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("createSchedule")}
        </Button>
      </div>

      {/* Table */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? tCommon("noResults") : t("messages.noSchedules")}
        </div>
      ) : (
        <BaseTable
          columns={columns}
          data={filteredSchedules}
          noResultsText={tCommon("noResults")}
          previousText={tCommon("previous")}
          nextText={tCommon("next")}
        />
      )}

      {/* Schedule Form Dialog */}
      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteSchedule")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {scheduleToDelete?.assignmentCount &&
              scheduleToDelete.assignmentCount > 0 ? (
                <>
                  <p className="text-destructive font-medium">
                    {t("messages.hasAssignmentsWarning", {
                      count: scheduleToDelete.assignmentCount,
                    })}
                  </p>
                  <p>{t("messages.deleteWithAssignmentsConfirm")}</p>
                </>
              ) : (
                <p>{t("messages.confirmDelete")}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

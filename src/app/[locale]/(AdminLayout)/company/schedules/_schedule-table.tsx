"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, MoreHorizontal, Star } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
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
import { ScheduleType } from "@/types/attendance-enums";
import { getSchedules, deleteSchedule } from "@/lib/apis/work-schedule-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { ScheduleForm } from "./_schedule-form";

/**
 * Component hiển thị bảng danh sách lịch làm việc
 * Hỗ trợ CRUD operations và hiển thị thông tin schedule
 */
export function ScheduleTable() {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

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

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
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
    fetchSchedules();
  }, [fetchSchedules]);

  // Handle delete
  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule(scheduleToDelete.id);
      toast.success(t("messages.deleteSuccess"));
      fetchSchedules();
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
    fetchSchedules();
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
      cell: ({ row }) => {
        const type = row.original.type as ScheduleType;
        return (
          <Badge variant="secondary">
            {getEnumLabel("scheduleType", type, tEnums)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "scheduleData.workStartTime",
      header: t("table.workStart"),
      cell: ({ row }) => row.original.scheduleData.workStartTime,
    },
    {
      accessorKey: "scheduleData.workEndTime",
      header: t("table.workEnd"),
      cell: ({ row }) => row.original.scheduleData.workEndTime,
    },
    {
      accessorKey: "scheduleData.breakMinutes",
      header: t("table.breakTime"),
      cell: ({ row }) =>
        `${row.original.scheduleData.breakMinutes} ${tCommon("time")}`,
    },
    {
      accessorKey: "isDefault",
      header: t("table.isDefault"),
      cell: ({ row }) => (
        <span>{row.original.isDefault ? tCommon("yes") : tCommon("no")}</span>
      ),
    },
    {
      accessorKey: "assignmentCount",
      header: t("table.assignmentCount"),
      cell: ({ row }) => row.original.assignmentCount,
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createSchedule")}
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("messages.noSchedules")}
        </div>
      ) : (
        <BaseTable
          columns={columns}
          data={schedules}
          filterColumn="name"
          filterPlaceholder={`${tCommon("search")}...`}
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
            <AlertDialogDescription>
              {scheduleToDelete?.assignmentCount &&
              scheduleToDelete.assignmentCount > 0
                ? t("messages.hasAssignments")
                : t("messages.confirmDelete")}
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

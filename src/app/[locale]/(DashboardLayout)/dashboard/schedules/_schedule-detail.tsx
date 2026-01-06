"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Users, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkSchedule, ScheduleAssignment } from "@/types/attendance-records";
import {
  getScheduleById,
  getScheduleAssignments,
  deleteSchedule,
} from "@/lib/apis/work-schedule-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatDate } from "@/lib/utils/format-date";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { useLocale } from "next-intl";
import { ScheduleForm } from "./_schedule-form";
import { ScheduleAssignmentDialog } from "./_schedule-assignment-dialog";

interface ScheduleDetailProps {
  scheduleId: number;
}

/**
 * Component hiển thị chi tiết lịch làm việc
 * Bao gồm thông tin schedule và danh sách assignments
 */
export function ScheduleDetail({ scheduleId }: ScheduleDetailProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();

  const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch schedule và assignments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduleData, assignmentsData] = await Promise.all([
        getScheduleById(scheduleId),
        getScheduleAssignments(scheduleId),
      ]);
      setSchedule(scheduleData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [scheduleId, tCommon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete
  const handleDelete = async () => {
    if (!schedule) return;

    try {
      await deleteSchedule(schedule.id);
      toast.success(t("messages.deleteSuccess"));
      router.push("/dashboard/schedules");
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowEditForm(false);
    fetchData();
  };

  // Handle assignment success
  const handleAssignSuccess = () => {
    setShowAssignDialog(false);
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8">{tCommon("loading")}</div>;
  }

  if (!schedule) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {tCommon("noData")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/schedules")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tCommon("back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
            <Users className="mr-2 h-4 w-4" />
            {t("assignSchedule")}
          </Button>
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {tCommon("edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      {/* Schedule Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {schedule.name}
            {schedule.isDefault && (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("form.type")}</p>
              <Badge variant="secondary">
                {getEnumLabel("scheduleType", schedule.type, tEnums)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.workStart")}
              </p>
              <p className="font-medium">
                {schedule.scheduleData.workStartTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.workEnd")}
              </p>
              <p className="font-medium">{schedule.scheduleData.workEndTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.breakTime")}
              </p>
              <p className="font-medium">
                {schedule.scheduleData.breakMinutes} {tCommon("minutes")}
              </p>
            </div>
          </div>

          {/* Flexible schedule info */}
          {schedule.type === "FLEXIBLE" &&
            schedule.scheduleData.flexibleStartRange && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("table.effectiveFrom")}
                  </p>
                  <p className="font-medium">
                    {schedule.scheduleData.flexibleStartRange}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("table.effectiveTo")}
                  </p>
                  <p className="font-medium">
                    {schedule.scheduleData.flexibleEndRange}
                  </p>
                </div>
              </div>
            )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {t("table.isDefault")}
            </p>
            <p className="font-medium">
              {schedule.isDefault ? tCommon("yes") : tCommon("no")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("assignment.title")} ({assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              {tCommon("noData")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{tCommon("name")}</TableHead>
                  <TableHead>{t("table.effectiveFrom")}</TableHead>
                  <TableHead>{t("table.effectiveTo")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment, index) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {assignment.employeeName}
                    </TableCell>
                    <TableCell>
                      {formatDate(
                        assignment.effectiveFrom,
                        locale as SupportedLocale,
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.effectiveTo
                        ? formatDate(
                            assignment.effectiveTo,
                            locale as SupportedLocale,
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Form Dialog */}
      {showEditForm && (
        <ScheduleForm
          schedule={schedule}
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Assignment Dialog */}
      {showAssignDialog && (
        <ScheduleAssignmentDialog
          schedule={schedule}
          open={showAssignDialog}
          onClose={() => setShowAssignDialog(false)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteSchedule")}</AlertDialogTitle>
            <AlertDialogDescription>
              {assignments.length > 0
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

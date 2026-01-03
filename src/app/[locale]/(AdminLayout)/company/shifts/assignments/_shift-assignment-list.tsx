"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Plus, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ShiftAssignment } from "@/types/attendance-records";
import {
  getShiftAssignments,
  deleteShiftAssignment,
} from "@/lib/apis/shift-api";
import { formatDate, getDayOfWeek } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { ShiftAssignmentDialog } from "./_shift-assignment-dialog";
import { ShiftDetailDialog } from "./_shift-detail-dialog";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 50;

/**
 * Component danh sách phân công ca làm việc - nhóm theo ngày
 */
export function ShiftAssignmentList() {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] =
    useState<ShiftAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] =
    useState<ShiftAssignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch danh sách assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getShiftAssignments(page, DEFAULT_LIMIT);
      setAssignments(response.content);
      setTotalElements(response.totalElements);
    } catch {
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [page, tCommon]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Nhóm assignments theo ngày
  const groupedAssignments = useMemo(() => {
    const groups: Record<string, ShiftAssignment[]> = {};

    assignments.forEach((assignment) => {
      const date = assignment.workDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(assignment);
    });

    // Sắp xếp theo ngày giảm dần (mới nhất trước)
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [assignments]);

  // Xử lý xóa assignment
  const handleDelete = async () => {
    if (!deletingAssignment) return;
    try {
      setIsDeleting(true);
      await deleteShiftAssignment(deletingAssignment.id);
      toast.success(t("assignmentDeleteSuccess"));
      setDeletingAssignment(null);
      fetchAssignments();
    } catch {
      toast.error(t("assignmentCreateError"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Format thời gian HH:mm
  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    return time.substring(0, 5);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalElements / DEFAULT_LIMIT);

  // Kiểm tra ngày hôm nay
  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {tCommon("total")}: {totalElements}
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createAssignment")}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {tCommon("loading")}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noAssignments")}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedAssignments.map(([date, items]) => {
                const today = isToday(date);
                return (
                  <div key={date} className="space-y-2">
                    {/* Header ngày */}
                    <div
                      className={`flex items-center gap-2 py-2 border-b ${
                        today ? "border-primary" : ""
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          today ? "text-primary" : "text-primary"
                        }`}
                      >
                        {getDayOfWeek(date, locale)}
                      </span>
                      <span
                        className={`text-sm ${
                          today
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(date, locale)}
                      </span>
                      {today && (
                        <Badge variant="default" className="text-xs">
                          {tCommon("today")}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="ml-auto">
                        {items.length}
                      </Badge>
                    </div>

                    {/* Danh sách assignments trong ngày */}
                    <div className="space-y-2">
                      {items.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium">
                                {assignment.employeeName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.shiftName ||
                                  assignment.shiftTemplate?.name}{" "}
                                •{" "}
                                {formatTime(
                                  assignment.shiftStartTime ||
                                    assignment.shiftTemplate?.startTime,
                                )}{" "}
                                -{" "}
                                {formatTime(
                                  assignment.shiftEndTime ||
                                    assignment.shiftTemplate?.endTime,
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                assignment.status === "COMPLETED"
                                  ? "default"
                                  : assignment.status === "SWAPPED"
                                    ? "secondary"
                                    : assignment.status === "CANCELLED"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {getEnumLabel(
                                "shiftAssignmentStatus",
                                assignment.status,
                                tEnums,
                              )}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {assignment.status === "SCHEDULED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setDeletingAssignment(assignment)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <ShiftAssignmentDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchAssignments}
      />

      {/* Detail Dialog */}
      <ShiftDetailDialog
        open={!!viewingAssignment}
        onOpenChange={(open: boolean) => !open && setViewingAssignment(null)}
        assignment={viewingAssignment}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAssignment}
        onOpenChange={(open: boolean) => !open && setDeletingAssignment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingAssignment?.employeeName} -{" "}
              {deletingAssignment?.shiftName ||
                deletingAssignment?.shiftTemplate?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

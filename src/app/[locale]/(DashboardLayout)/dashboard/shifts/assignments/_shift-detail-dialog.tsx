"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShiftAssignment } from "@/types/attendance-records";
import { formatDate, formatTime, getDayOfWeek } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { deleteShiftAssignment } from "@/lib/apis/shift-api";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ShiftAssignment | null;
  onDelete?: () => void;
}

/**
 * Dialog hiển thị chi tiết phân công ca
 * Bao gồm thông tin ca và thông tin nhân viên
 * Có nút xóa nếu ca chưa được thực hiện
 */
export function ShiftDetailDialog({
  open,
  onOpenChange,
  assignment,
  onDelete,
}: ShiftDetailDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!assignment) return null;

  // Lấy thông tin từ shiftTemplate hoặc trực tiếp
  const shiftName = assignment.shiftName || assignment.shiftTemplate?.name;
  const shiftStartTime =
    assignment.shiftStartTime || assignment.shiftTemplate?.startTime;
  const shiftEndTime =
    assignment.shiftEndTime || assignment.shiftTemplate?.endTime;

  // Xử lý xóa assignment
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteShiftAssignment(assignment.id);
      toast.success(t("assignmentDeleteSuccess"));
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onDelete?.();
    } catch {
      toast.error(t("assignmentCreateError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("assignmentDetailTitle")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Thông tin nhân viên */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {t("employeeInfo")}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tCommon("name")}
                  </span>
                  <span className="text-sm font-medium">
                    {assignment.employeeName}
                  </span>
                </div>
                {assignment.swappedWithEmployeeName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("targetEmployee")}
                    </span>
                    <span className="text-sm font-medium">
                      {assignment.swappedWithEmployeeName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Thông tin ca */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {t("shiftInfo")}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("table.shift")}
                  </span>
                  <span className="text-sm font-medium">{shiftName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("table.time")}
                  </span>
                  <span className="text-sm font-medium">
                    {formatTime(shiftStartTime)} - {formatTime(shiftEndTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("table.date")}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-medium text-right">
                    <div>（{getDayOfWeek(assignment.workDate, locale)}）</div>
                    <div>{formatDate(assignment.workDate, locale)}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("table.status")}
                  </span>
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
                </div>
              </div>
            </div>
          </div>

          {/* Footer với nút xóa nếu status là SCHEDULED */}
          {assignment.status === "SCHEDULED" && (
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCommon("delete")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {assignment?.employeeName} - {shiftName}
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

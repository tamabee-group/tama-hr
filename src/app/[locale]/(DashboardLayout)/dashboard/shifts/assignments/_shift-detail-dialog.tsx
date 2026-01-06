"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShiftAssignment } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: ShiftAssignment | null;
}

/**
 * Dialog hiển thị chi tiết phân công ca
 * Bao gồm thông tin ca và thông tin nhân viên
 */
export function ShiftDetailDialog({
  open,
  onOpenChange,
  assignment,
}: ShiftDetailDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (!assignment) return null;

  // Format thời gian HH:mm
  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    return time.substring(0, 5);
  };

  // Lấy thông tin từ shiftTemplate hoặc trực tiếp
  const shiftName = assignment.shiftName || assignment.shiftTemplate?.name;
  const shiftStartTime =
    assignment.shiftStartTime || assignment.shiftTemplate?.startTime;
  const shiftEndTime =
    assignment.shiftEndTime || assignment.shiftTemplate?.endTime;

  return (
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
                <span className="text-sm font-medium">
                  {formatDate(assignment.workDate, locale)}
                </span>
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
      </DialogContent>
    </Dialog>
  );
}

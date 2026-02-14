"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  updateEmployeeLeaveBalance,
  LeaveBalanceSummaryResponse,
  LeaveBalanceResponse,
} from "@/lib/apis/leave-balance-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface UpdateBalanceDialogProps {
  employee: LeaveBalanceSummaryResponse | null;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog cập nhật số ngày phép cho 1 nhân viên
 * Hiển thị form với 2 loại phép: ANNUAL và SICK
 * Mỗi loại hiển thị: Tổng ngày cấp (input), Đã sử dụng (readonly), Còn lại (calculated)
 */
export function UpdateBalanceDialog({
  employee,
  year,
  open,
  onOpenChange,
  onSuccess,
}: UpdateBalanceDialogProps) {
  const t = useTranslations("leaveBalance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");

  // State cho form values
  const [annualTotalDays, setAnnualTotalDays] = useState<number>(0);
  const [sickTotalDays, setSickTotalDays] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy thông tin balance hiện tại từ employee
  const getBalance = (leaveType: "ANNUAL" | "SICK"): LeaveBalanceResponse => {
    const balance = employee?.balances.find((b) => b.leaveType === leaveType);
    return (
      balance || { leaveType, totalDays: 0, usedDays: 0, remainingDays: 0 }
    );
  };

  const annualBalance = getBalance("ANNUAL");
  const sickBalance = getBalance("SICK");

  // Reset form khi dialog mở hoặc employee thay đổi
  useEffect(() => {
    if (open && employee) {
      setAnnualTotalDays(annualBalance.totalDays);
      setSickTotalDays(sickBalance.totalDays);
    }
  }, [open, employee, annualBalance.totalDays, sickBalance.totalDays]);

  // Tính số ngày còn lại (total - used)
  const calculateRemaining = (totalDays: number, usedDays: number): number => {
    return Math.max(0, totalDays - usedDays);
  };

  // Kiểm tra có thay đổi không
  const hasChanges =
    annualTotalDays !== annualBalance.totalDays ||
    sickTotalDays !== sickBalance.totalDays;

  // Handle submit
  const handleSubmit = async () => {
    if (!employee) return;

    setIsSubmitting(true);
    try {
      // Cập nhật ANNUAL nếu có thay đổi
      if (annualTotalDays !== annualBalance.totalDays) {
        await updateEmployeeLeaveBalance(employee.employeeId, {
          year,
          leaveType: "ANNUAL",
          totalDays: annualTotalDays,
        });
      }

      // Cập nhật SICK nếu có thay đổi
      if (sickTotalDays !== sickBalance.totalDays) {
        await updateEmployeeLeaveBalance(employee.employeeId, {
          year,
          leaveType: "SICK",
          totalDays: sickTotalDays,
        });
      }

      toast.success(t("dialog.updateSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {t("dialog.title")} - {employee.employeeName}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>{t("dialog.description")}</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Năm */}
          <div className="text-sm text-muted-foreground">
            {t("dialog.year")}:{" "}
            <span className="font-medium text-foreground">{year}</span>
          </div>

          {/* Phép năm (ANNUAL) */}
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <Label className="text-base font-medium">
              {getEnumLabel("leaveType", "ANNUAL", tEnums)}
            </Label>

            <div className="grid gap-3">
              {/* Tổng ngày cấp - Input */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.totalDays")}:
                </span>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={annualTotalDays}
                  onChange={(e) =>
                    setAnnualTotalDays(parseInt(e.target.value) || 0)
                  }
                  className="w-24 text-right"
                  disabled={isSubmitting}
                />
              </div>

              {/* Đã sử dụng - Readonly */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.usedDays")}:
                </span>
                <span className="text-sm font-medium">
                  {annualBalance.usedDays} {t("dialog.days")}
                </span>
              </div>

              {/* Còn lại - Calculated */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.remainingDays")}:
                </span>
                <span className="text-sm font-medium text-primary">
                  {calculateRemaining(annualTotalDays, annualBalance.usedDays)}{" "}
                  {t("dialog.days")}
                </span>
              </div>
            </div>
          </div>

          {/* Phép ốm (SICK) */}
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <Label className="text-base font-medium">
              {getEnumLabel("leaveType", "SICK", tEnums)}
            </Label>

            <div className="grid gap-3">
              {/* Tổng ngày cấp - Input */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.totalDays")}:
                </span>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={sickTotalDays}
                  onChange={(e) =>
                    setSickTotalDays(parseInt(e.target.value) || 0)
                  }
                  className="w-24 text-right"
                  disabled={isSubmitting}
                />
              </div>

              {/* Đã sử dụng - Readonly */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.usedDays")}:
                </span>
                <span className="text-sm font-medium">
                  {sickBalance.usedDays} {t("dialog.days")}
                </span>
              </div>

              {/* Còn lại - Calculated */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("dialog.remainingDays")}:
                </span>
                <span className="text-sm font-medium text-primary">
                  {calculateRemaining(sickTotalDays, sickBalance.usedDays)}{" "}
                  {t("dialog.days")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !hasChanges}>
            {isSubmitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

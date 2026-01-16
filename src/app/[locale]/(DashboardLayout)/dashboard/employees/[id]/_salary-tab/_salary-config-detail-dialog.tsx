"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Calendar, Banknote, Edit, Trash2, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Spinner } from "@/components/ui/spinner";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import {
  deleteSalaryConfig,
  applySalaryConfig,
} from "@/lib/apis/salary-config-api";

interface SalaryConfigDetailDialogProps {
  config: EmployeeSalaryConfig | null;
  employeeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (config: EmployeeSalaryConfig) => void;
  onDeleted: () => void;
}

export function SalaryConfigDetailDialog({
  config,
  employeeId,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: SalaryConfigDetailDialogProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!config) return null;

  const canModify = !config.usedInPayroll;

  // Lấy label cho salary type
  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case "MONTHLY":
        return t("typeMonthly");
      case "DAILY":
        return t("typeDaily");
      case "HOURLY":
        return t("typeHourly");
      case "SHIFT_BASED":
        return t("typeShiftBased");
      default:
        return type;
    }
  };

  // Lấy số tiền dựa trên loại lương
  const getSalaryAmount = () => {
    switch (config.salaryType) {
      case "MONTHLY":
        return config.monthlySalary;
      case "DAILY":
        return config.dailyRate;
      case "HOURLY":
        return config.hourlyRate;
      case "SHIFT_BASED":
        return config.shiftRate;
      default:
        return 0;
    }
  };

  // Xác định trạng thái
  const getStatus = () => {
    if (config.isActive) {
      return { label: t("statusActive"), variant: "default" as const };
    }
    const today = new Date().toISOString().split("T")[0];

    // Quá hạn: effectiveTo < today
    if (config.effectiveTo && config.effectiveTo < today) {
      return { label: t("statusExpired"), variant: "outline" as const };
    }

    // Sắp áp dụng: effectiveFrom > today
    if (config.effectiveFrom > today) {
      return { label: t("statusUpcoming"), variant: "secondary" as const };
    }

    // Còn hiệu lực nhưng không phải current
    return { label: t("statusValid"), variant: "secondary" as const };
  };

  // Kiểm tra có thể áp dụng không (không quá hạn và chưa active)
  const canApply = () => {
    if (config.isActive) return false;
    if (!canModify) return false;
    const today = new Date().toISOString().split("T")[0];
    // Quá hạn thì không cho áp dụng
    if (config.effectiveTo && config.effectiveTo < today) return false;
    return true;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSalaryConfig(employeeId, config.id);
      toast.success(t("deleteSuccess"));
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Error deleting salary config:", error);
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applySalaryConfig(employeeId, config.id);
      toast.success(t("applySuccess"));
      setShowApplyConfirm(false);
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Error applying salary config:", error);
      toast.error(t("applyError"));
    } finally {
      setIsApplying(false);
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(config);
  };

  const status = getStatus();
  const amount = getSalaryAmount();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t("detailTitle")}
              <Badge
                variant={status.variant}
                className={
                  config.isActive ? "bg-green-600 hover:bg-green-600" : ""
                }
              >
                {status.label}
              </Badge>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("detailTitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Loại lương và số tiền */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {getSalaryTypeLabel(config.salaryType)}
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(amount || 0)}
                </p>
              </div>
            </div>

            {/* Thời gian hiệu lực */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t("effectivePeriod")}
                </p>
                <p className="font-medium">
                  {formatDate(config.effectiveFrom, locale)}
                  {config.effectiveTo
                    ? ` → ${formatDate(config.effectiveTo, locale)}`
                    : ` → ${t("current")}`}
                </p>
              </div>
            </div>

            {/* Ghi chú */}
            {config.note && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500/10">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("note")}</p>
                  <p className="font-medium">{config.note}</p>
                </div>
              </div>
            )}

            {/* Thông báo không thể sửa/xóa */}
            {!canModify && (
              <p className="text-sm text-muted-foreground text-center">
                {t("cannotModifyUsed")}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            {canModify && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tCommon("delete")}
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit")}
                </Button>
                {canApply() && (
                  <Button onClick={() => setShowApplyConfirm(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    {t("apply")}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
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
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {isDeleting ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Apply Dialog */}
      <AlertDialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("applyTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("applyDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplying}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApply} disabled={isApplying}>
              {isApplying ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {isApplying ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

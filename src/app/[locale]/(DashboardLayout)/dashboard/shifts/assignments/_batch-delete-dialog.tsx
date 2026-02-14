"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";
import { batchDeleteShiftAssignments } from "@/lib/apis/shift-api";
import { apiClient } from "@/lib/utils/fetch-client";
import {
  formatDateForApi,
  formatDate,
  getDayOfWeek,
} from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface BatchDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type DeleteMode = "single" | "range";

/**
 * Dialog xóa phân ca hàng loạt
 * Hỗ trợ xóa theo ngày đơn hoặc khoảng thời gian
 */
export function BatchDeleteDialog({
  open,
  onOpenChange,
  onSuccess,
}: BatchDeleteDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mode, setMode] = useState<DeleteMode>("single");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchData();
      setMode("single");
      setSelectedEmployeeIds([]);
      setStartDate(new Date());
      setEndDate(new Date());
      setErrors({});
      setShowConfirmation(false);
      setResult(null);
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const employeesRes = await apiClient.get<PaginatedResponse<User>>(
        "/api/company/employees?page=0&size=100",
      );
      setEmployees(employeesRes.content);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
    if (errors.employees) {
      setErrors((prev) => ({ ...prev, employees: "" }));
    }
  };

  const toggleAll = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees.map((e) => e.id));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (selectedEmployeeIds.length === 0) {
      newErrors.employees = tCommon("checkInfo");
    }
    if (!startDate) {
      newErrors.startDate = tCommon("checkInfo");
    }
    if (mode === "range") {
      if (!endDate) {
        newErrors.endDate = tCommon("checkInfo");
      } else if (endDate < startDate!) {
        newErrors.endDate = t("endDateMustAfterStart");
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowConfirmation = () => {
    if (!validate()) return;
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setShowConfirmation(false);

    try {
      setIsSubmitting(true);
      const response = await batchDeleteShiftAssignments({
        employeeIds: selectedEmployeeIds,
        startDate: formatDateForApi(startDate) || "",
        endDate: mode === "range" ? formatDateForApi(endDate) : undefined,
      });

      setResult({
        success: response.successCount,
        failed: response.failedCount,
      });

      if (response.successCount > 0) {
        toast.success(
          t("batchDeleteSuccess", { count: response.successCount }),
        );
        onSuccess();

        // Đóng dialog nếu tất cả thành công
        if (response.failedCount === 0) {
          onOpenChange(false);
        }
      }

      if (response.failedCount > 0 && response.successCount === 0) {
        toast.error(t("batchDeleteAllFailed"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính số ngày được chọn
  const calculateDays = () => {
    if (mode === "single" || !startDate) return 1;
    if (!endDate) return 1;
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    return days;
  };

  const totalDeletions = selectedEmployeeIds.length * calculateDays();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("batchDelete")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("batchDelete")}
            </DialogDescription>
          </DialogHeader>

          {isLoadingData ? (
            <div className="py-8 text-center text-muted-foreground">
              {tCommon("loading")}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Kết quả */}
              {result && (
                <Alert variant={result.failed > 0 ? "destructive" : "default"}>
                  {result.failed > 0 ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="font-medium">
                      {t("batchDeleteResult", {
                        success: result.success,
                        failed: result.failed,
                      })}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Cảnh báo */}
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t("batchDeleteWarning")}</AlertDescription>
              </Alert>
              <div>
                <Label>{t("deleteMode")}</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(value) => setMode(value as DeleteMode)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="delete-mode-single" />
                    <Label
                      htmlFor="delete-mode-single"
                      className="cursor-pointer"
                    >
                      {t("singleDay")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="delete-mode-range" />
                    <Label
                      htmlFor="delete-mode-range"
                      className="cursor-pointer"
                    >
                      {t("dateRange")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Chọn ngày */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    {mode === "single" ? t("workDate") : t("startDate")}
                  </Label>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    locale={locale}
                    placeholder={
                      mode === "single" ? t("workDate") : t("startDate")
                    }
                    className={`w-full ${errors.startDate ? "border-destructive" : ""}`}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {mode === "range" && (
                  <div>
                    <Label>{t("endDate")}</Label>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      locale={locale}
                      placeholder={t("endDate")}
                      className={`w-full ${errors.endDate ? "border-destructive" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                )}

                {mode === "single" && <div />}
              </div>

              {/* Chọn nhân viên */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>{t("selectEmployees")}</Label>
                  <Button variant="ghost" size="sm" onClick={toggleAll}>
                    {selectedEmployeeIds.length === employees.length
                      ? tCommon("deselectAll")
                      : tCommon("selectAll")}
                  </Button>
                </div>
                <div
                  className={`border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2 ${
                    errors.employees ? "border-destructive" : ""
                  }`}
                >
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`del-emp-${employee.id}`}
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <label
                        htmlFor={`del-emp-${employee.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {employee.profile?.name || employee.email} (
                        {employee.employeeCode})
                      </label>
                    </div>
                  ))}
                </div>
                {errors.employees && (
                  <p className="text-sm text-destructive">{errors.employees}</p>
                )}
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>
                    {t("selectedCount", { count: selectedEmployeeIds.length })}
                  </span>
                  {mode === "range" && calculateDays() > 1 && (
                    <span>
                      {t("totalDeletions", { count: totalDeletions })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleShowConfirmation}
              disabled={isSubmitting || isLoadingData}
            >
              {tCommon("continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3 px-6">
            <div className="text-destructive font-medium">
              {t("confirmDeleteWarning")}
            </div>
            <div className="space-y-2 text-sm text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {mode === "single" ? t("workDate") : t("dateRange")}:
                </span>
                <span className="font-medium">
                  {mode === "single" ? (
                    <>
                      （
                      {getDayOfWeek(formatDateForApi(startDate) || "", locale)}
                      ）{formatDate(formatDateForApi(startDate) || "", locale)}
                    </>
                  ) : (
                    <>
                      {formatDate(formatDateForApi(startDate) || "", locale)} -{" "}
                      {formatDate(formatDateForApi(endDate) || "", locale)}
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("employees")}:</span>
                <span className="font-medium">
                  {selectedEmployeeIds.length}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">
                  {t("totalDeletions", { count: totalDeletions })}
                </span>
                <span className="font-semibold text-destructive">
                  {totalDeletions}
                </span>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? tCommon("loading") : tCommon("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

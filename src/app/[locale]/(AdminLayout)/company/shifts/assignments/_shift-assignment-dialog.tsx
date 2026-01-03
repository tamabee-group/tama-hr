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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ShiftTemplate } from "@/types/attendance-records";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";
import { getAllShiftTemplates, batchAssignShift } from "@/lib/apis/shift-api";
import { apiClient } from "@/lib/utils/fetch-client";
import { formatDateForApi } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog phân công ca làm việc cho nhiều nhân viên
 */
export function ShiftAssignmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: ShiftAssignmentDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [employees, setEmployees] = useState<User[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [shiftTemplateId, setShiftTemplateId] = useState<number>(0);
  const [workDate, setWorkDate] = useState<Date | undefined>(new Date());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    failedDetails: { name: string; reason: string }[];
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchData();
      setSelectedEmployeeIds([]);
      setShiftTemplateId(0);
      setWorkDate(new Date());
      setErrors({});
      setResult(null);
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const [employeesRes, templatesRes] = await Promise.all([
        apiClient.get<PaginatedResponse<User>>(
          "/api/company/employees?page=0&size=100",
        ),
        getAllShiftTemplates(),
      ]);
      setEmployees(employeesRes.content);
      setTemplates(templatesRes.filter((t) => t.isActive));
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
    if (!shiftTemplateId) {
      newErrors.shiftTemplateId = tCommon("checkInfo");
    }
    if (!workDate) {
      newErrors.workDate = tCommon("checkInfo");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const response = await batchAssignShift({
        employeeIds: selectedEmployeeIds,
        shiftTemplateId,
        workDate: formatDateForApi(workDate) || "",
      });

      setResult({
        success: response.successCount,
        failed: response.failedCount,
        failedDetails: response.failedAssignments.map((f) => ({
          name: f.employeeName || `ID: ${f.employeeId}`,
          reason: f.reason,
        })),
      });

      if (response.successCount > 0) {
        toast.success(
          t("batchAssignSuccess", { count: response.successCount }),
        );
        onSuccess();

        // Đóng dialog nếu tất cả thành công
        if (response.failedCount === 0) {
          onOpenChange(false);
        }
      }

      if (response.failedCount > 0 && response.successCount === 0) {
        toast.error(t("batchAssignAllFailed"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createAssignment")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("createAssignment")}
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
                    {t("batchResult", {
                      success: result.success,
                      failed: result.failed,
                    })}
                  </div>
                  {result.failedDetails.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-sm font-medium">
                        {t("failedEmployees")}:
                      </div>
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        {result.failedDetails.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              - {item.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Ngày làm việc */}
              <div className="space-y-2">
                <Label>{t("workDate")}</Label>
                <DatePicker
                  value={workDate}
                  onChange={setWorkDate}
                  locale={locale}
                  placeholder={t("workDate")}
                  className={`w-full ${errors.workDate ? "border-destructive" : ""}`}
                />
              </div>

              {/* Chọn ca */}
              <div className="space-y-2">
                <Label>{t("selectShift")}</Label>
                <SelectWithIcon
                  value={shiftTemplateId ? shiftTemplateId.toString() : ""}
                  onValueChange={(value) => setShiftTemplateId(parseInt(value))}
                  placeholder={t("selectShift")}
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                >
                  {templates.map((template) => (
                    <SelectItem
                      key={template.id}
                      value={template.id.toString()}
                    >
                      {template.name} ({formatTime(template.startTime)} -{" "}
                      {formatTime(template.endTime)})
                    </SelectItem>
                  ))}
                </SelectWithIcon>
                {errors.shiftTemplateId && (
                  <p className="text-sm text-destructive">
                    {errors.shiftTemplateId}
                  </p>
                )}
              </div>
            </div>

            {/* Chọn nhân viên */}
            <div className="space-y-2">
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
                      id={`emp-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                    />
                    <label
                      htmlFor={`emp-${employee.id}`}
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
              <p className="text-sm text-muted-foreground">
                {t("selectedCount", { count: selectedEmployeeIds.length })}
              </p>
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
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingData}
          >
            {isSubmitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

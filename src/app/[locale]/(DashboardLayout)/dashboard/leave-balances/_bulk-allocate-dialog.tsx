"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { bulkAllocateLeaveBalance } from "@/lib/apis/leave-balance-api";
import { getEmployees } from "@/lib/apis/company-employees";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { User } from "@/types/user";
import { LeaveType } from "@/types/attendance-enums";

interface BulkAllocateDialogProps {
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog cấp phát số ngày phép hàng loạt
 * Cho phép chọn năm, loại phép, số ngày và áp dụng cho tất cả hoặc chọn nhân viên cụ thể
 */
export function BulkAllocateDialog({
  year,
  open,
  onOpenChange,
  onSuccess,
}: BulkAllocateDialogProps) {
  const t = useTranslations("leaveBalance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");

  // State cho form
  const [selectedYear, setSelectedYear] = useState<string>(year.toString());
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [totalDays, setTotalDays] = useState<number>(12);
  const [applyTo, setApplyTo] = useState<"all" | "selected">("all");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

  // State cho danh sách nhân viên
  const [employees, setEmployees] = useState<User[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // State cho submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tạo danh sách năm (năm hiện tại ± 2 năm)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch danh sách nhân viên khi dialog mở
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const response = await getEmployees(0, 1000);
      // Lọc chỉ lấy nhân viên ACTIVE
      const activeEmployees = response.content.filter(
        (emp) => emp.status === "ACTIVE",
      );
      setEmployees(activeEmployees);
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoadingEmployees(false);
    }
  }, [tErrors]);

  // Reset form khi dialog mở
  useEffect(() => {
    if (open) {
      setSelectedYear(year.toString());
      setLeaveType("ANNUAL");
      setTotalDays(12);
      setApplyTo("all");
      setSelectedEmployeeIds([]);
      fetchEmployees();
    }
  }, [open, year, fetchEmployees]);

  // Tính số nhân viên sẽ được cập nhật
  const affectedCount =
    applyTo === "all" ? employees.length : selectedEmployeeIds.length;

  // Handle chọn/bỏ chọn nhân viên
  const handleEmployeeToggle = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  // Handle chọn tất cả nhân viên
  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees.map((emp) => emp.id));
    }
  };

  // Validate form
  const isValid =
    totalDays > 0 &&
    (applyTo === "all" || selectedEmployeeIds.length > 0) &&
    affectedCount > 0;

  // Handle submit
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await bulkAllocateLeaveBalance({
        year: parseInt(selectedYear),
        leaveType,
        totalDays,
        employeeIds: applyTo === "all" ? undefined : selectedEmployeeIds,
      });

      toast.success(t("bulkDialog.success", { count: affectedCount }));
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("bulkDialog.title")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>{t("bulkDialog.description")}</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Năm */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("bulkDialog.year")}</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loại phép */}
            <div className="space-y-2">
              <Label>{t("bulkDialog.leaveType")}</Label>
              <Select
                value={leaveType}
                onValueChange={(value) => setLeaveType(value as LeaveType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">
                    {getEnumLabel("leaveType", "ANNUAL", tEnums)}
                  </SelectItem>
                  <SelectItem value="SICK">
                    {getEnumLabel("leaveType", "SICK", tEnums)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Số ngày */}
          <div className="space-y-2">
            <Label>{t("bulkDialog.totalDays")}</Label>
            <Input
              type="number"
              min={0}
              max={365}
              value={totalDays}
              onChange={(e) => setTotalDays(parseInt(e.target.value) || 0)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Áp dụng cho */}
          <div className="space-y-3">
            <Label>{t("bulkDialog.applyTo")}</Label>
            <RadioGroup
              value={applyTo}
              onValueChange={(value) => setApplyTo(value as "all" | "selected")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" disabled={isSubmitting} />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  {t("bulkDialog.allEmployees", { count: employees.length })}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="selected"
                  id="selected"
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="selected"
                  className="font-normal cursor-pointer"
                >
                  {t("bulkDialog.selectEmployees")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Danh sách nhân viên khi chọn "Chọn nhân viên cụ thể" */}
          {applyTo === "selected" && (
            <div className="space-y-2">
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    {tCommon("loading")}
                  </span>
                </div>
              ) : (
                <>
                  {/* Chọn tất cả */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="select-all"
                      checked={
                        employees.length > 0 &&
                        selectedEmployeeIds.length === employees.length
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor="select-all"
                      className="font-medium cursor-pointer"
                    >
                      {t("bulkDialog.selectAll")} ({employees.length})
                    </Label>
                  </div>

                  {/* Danh sách nhân viên */}
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`employee-${employee.id}`}
                            checked={selectedEmployeeIds.includes(employee.id)}
                            onCheckedChange={(checked) =>
                              handleEmployeeToggle(
                                employee.id,
                                checked === true,
                              )
                            }
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor={`employee-${employee.id}`}
                            className="font-normal cursor-pointer flex-1"
                          >
                            <span>
                              {employee.profile?.name || employee.email}
                            </span>
                            {employee.employeeCode && (
                              <span className="text-muted-foreground ml-2">
                                ({employee.employeeCode})
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          )}

          {/* Thông báo số nhân viên sẽ được cập nhật */}
          {affectedCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                {t("bulkDialog.confirmation", { count: affectedCount })}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting ? tCommon("loading") : t("bulkDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EmploymentContract,
  EmploymentContractInput,
  EmployeeSalaryConfig,
} from "@/types/attendance-records";
import { ContractType, CONTRACT_TYPES } from "@/types/attendance-enums";
import { User } from "@/types/user";
import { createContract, updateContract } from "@/lib/apis/contract-api";
import { getEmployeeSalaryConfigHistory } from "@/lib/apis/salary-config-api";

import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatDateForApi } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ContractFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingContract?: EmploymentContract | null;
  preselectedEmployee?: User; // Thông tin employee đã có sẵn (tránh gọi API)
  currentContract?: EmploymentContract | null; // Hợp đồng hiện tại của employee (để tính ngày bắt đầu mặc định)
  availableEmployees?: Array<{ id: number; code: string; name: string }>; // Danh sách employees có sẵn (tránh gọi API)
  onEmployeeChange?: (employeeId: number | null) => void; // Callback khi employee thay đổi
}

/**
 * Dialog form tạo/sửa hợp đồng lao động
 * Hiển thị lỗi nếu hợp đồng bị trùng
 */
export function ContractFormDialog({
  open,
  onClose,
  onSuccess,
  existingContract,
  preselectedEmployee,
  currentContract,
  availableEmployees,
  onEmployeeChange,
}: ContractFormDialogProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const isEditing = !!existingContract;

  // Data state
  const [salaryConfigs, setSalaryConfigs] = useState<EmployeeSalaryConfig[]>(
    [],
  );

  // Form state - sử dụng Date object cho date fields
  const [employeeId, setEmployeeId] = useState("");
  const [contractType, setContractType] = useState<ContractType>("FULL_TIME");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [salaryConfigId, setSalaryConfigId] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tính danh sách employees để hiển thị
  const displayEmployees = useMemo(() => {
    if (preselectedEmployee) {
      return [
        {
          id: preselectedEmployee.id,
          code: preselectedEmployee.employeeCode || "",
          name: preselectedEmployee.profile?.name || preselectedEmployee.email,
        },
      ];
    }
    return availableEmployees || [];
  }, [preselectedEmployee, availableEmployees]);

  // Reset form
  const resetForm = useCallback(() => {
    setEmployeeId("");
    setContractType("FULL_TIME");

    // Nếu có currentContract, set startDate = endDate + 1 ngày
    if (currentContract?.endDate) {
      const nextDay = new Date(currentContract.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setStartDate(nextDay);
    } else {
      setStartDate(new Date());
    }

    setEndDate(undefined);
    setSalaryConfigId("");
    setNotes("");
  }, [currentContract]);

  // Fetch data khi mở dialog
  useEffect(() => {
    if (open) {
      if (existingContract) {
        setEmployeeId(existingContract.employeeId.toString());
        setContractType(existingContract.contractType);
        setStartDate(
          existingContract.startDate
            ? new Date(existingContract.startDate)
            : undefined,
        );
        setEndDate(
          existingContract.endDate
            ? new Date(existingContract.endDate)
            : undefined,
        );
        setSalaryConfigId(existingContract.salaryConfigId?.toString() || "");
        setNotes(existingContract.notes || "");
      } else {
        resetForm();
        // Nếu có preselectedEmployee, tự động chọn employee đó
        if (preselectedEmployee) {
          setEmployeeId(preselectedEmployee.id.toString());
        }
      }
      setOverlapError(null);
    }
  }, [open, existingContract, preselectedEmployee, resetForm]);

  // Fetch salary configs CHỈ khi edit contract
  useEffect(() => {
    if (open && employeeId && isEditing) {
      const empId = parseInt(employeeId);
      fetchSalaryConfigsOnly(empId);
    } else if (!isEditing) {
      setSalaryConfigs([]);
    }
  }, [employeeId, open, isEditing]);

  // Notify parent về employee change khi tạo mới (để parent tìm currentContract)
  useEffect(() => {
    if (open && employeeId && !isEditing) {
      const empId = parseInt(employeeId);
      onEmployeeChange?.(empId);
    } else if (!employeeId) {
      onEmployeeChange?.(null);
    }
  }, [employeeId, open, isEditing, onEmployeeChange]);

  // Update startDate khi currentContract thay đổi
  useEffect(() => {
    if (currentContract?.endDate && !isEditing) {
      const nextDay = new Date(currentContract.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setStartDate(nextDay);
    } else if (!currentContract && employeeId && !isEditing) {
      setStartDate(new Date());
    }
  }, [currentContract, employeeId, isEditing]);

  const fetchSalaryConfigsOnly = async (empId: number) => {
    try {
      setIsLoading(true);
      const salaryData = await getEmployeeSalaryConfigHistory(empId);
      setSalaryConfigs(salaryData);
    } catch (error) {
      console.error("Error fetching salary configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy label cho contract type
  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return t("typeFullTime");
      case "PART_TIME":
        return t("typePartTime");
      case "SEASONAL":
        return t("typeSeasonal");
      case "CONTRACT":
        return t("typeContract");
      default:
        return type;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!employeeId) {
      newErrors.employeeId = tCommon("checkInfo");
    }
    if (!startDate) {
      newErrors.startDate = tCommon("checkInfo");
    }
    if (!endDate) {
      newErrors.endDate = tCommon("checkInfo");
    }
    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = tCommon("checkInfo");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build input data
  const buildInputData = (): EmploymentContractInput => {
    return {
      contractType,
      startDate: formatDateForApi(startDate) || "",
      endDate: formatDateForApi(endDate) || "",
      salaryConfigId: salaryConfigId ? parseInt(salaryConfigId) : undefined,
      notes: notes.trim() || undefined,
    };
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const inputData = buildInputData();
      const empId = parseInt(employeeId);

      // Submit
      if (isEditing && existingContract) {
        await updateContract(existingContract.id, inputData);
        toast.success(t("updateSuccess"));
      } else {
        await createContract(empId, inputData);
        toast.success(t("createSuccess"));
      }
      onSuccess();
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("overlap")) {
        setOverlapError(t("overlapError"));
      } else {
        toast.error(getErrorMessage(errorMessage, tErrors));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            {tCommon("loading")}
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Overlap Error */}
            {overlapError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{overlapError}</AlertDescription>
              </Alert>
            )}

            {/* Chọn nhân viên */}
            <div>
              <Label>{t("table.employee")}</Label>
              <Select
                value={employeeId}
                onValueChange={(value) => {
                  setEmployeeId(value);
                  if (errors.employeeId) {
                    setErrors((prev) => ({ ...prev, employeeId: "" }));
                  }
                  setOverlapError(null);
                }}
                disabled={isEditing || !!preselectedEmployee}
              >
                <SelectTrigger
                  className={errors.employeeId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder={tCommon("select")} />
                </SelectTrigger>
                <SelectContent>
                  {displayEmployees.map(
                    (employee: { id: number; code: string; name: string }) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.name} ({employee.code})
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId}</p>
              )}
            </div>

            {/* Loại hợp đồng */}
            <div>
              <Label>{t("contractType")}</Label>
              <Select
                value={contractType}
                onValueChange={(value) =>
                  setContractType(value as ContractType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("contractTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getContractTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <Label>{t("startDate")}</Label>
              <DatePicker
                value={startDate}
                onChange={(value) => {
                  setStartDate(value);
                  if (errors.startDate) {
                    setErrors((prev) => ({ ...prev, startDate: "" }));
                  }
                  setOverlapError(null);
                }}
                locale={locale}
                placeholder={t("startDate")}
                className={`w-full ${errors.startDate ? "border-destructive" : ""}`}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            {/* Ngày kết thúc */}
            <div>
              <Label>{t("endDate")}</Label>
              <DatePicker
                value={endDate}
                onChange={(value) => {
                  setEndDate(value);
                  if (errors.endDate) {
                    setErrors((prev) => ({ ...prev, endDate: "" }));
                  }
                  setOverlapError(null);
                }}
                locale={locale}
                placeholder={t("endDate")}
                className={`w-full ${errors.endDate ? "border-destructive" : ""}`}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>

            {/* Cấu hình lương liên kết - chỉ hiển thị khi edit */}
            {isEditing && salaryConfigs.length > 0 && (
              <div>
                <Label>{t("linkedSalaryConfig")}</Label>
                <Select
                  value={salaryConfigId}
                  onValueChange={setSalaryConfigId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("linkedSalaryConfigPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {salaryConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id.toString()}>
                        {config.salaryType} - {config.effectiveFrom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <Label>{t("notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {tCommon("loading")}
              </>
            ) : (
              tCommon("save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, Calendar, Banknote, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EmployeeSalaryConfig,
  EmployeeSalaryConfigInput,
} from "@/types/attendance-records";
import { SalaryType, SALARY_TYPES } from "@/types/attendance-enums";
import {
  createSalaryConfig,
  updateSalaryConfig,
  validateSalaryConfig,
  SalaryConfigValidationResponse,
} from "@/lib/apis/salary-config-api";
import { formatDateForApi, formatDate } from "@/lib/utils/format-date";
import {
  formatCurrency,
  type SupportedLocale,
} from "@/lib/utils/format-currency";

interface SalaryConfigFormProps {
  employeeId: number;
  existingConfig?: EmployeeSalaryConfig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SalaryConfigForm({
  employeeId,
  existingConfig,
  onSuccess,
  onCancel,
}: SalaryConfigFormProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const isEditing = !!existingConfig;

  // Form state
  const [salaryType, setSalaryType] = useState<SalaryType>(
    existingConfig?.salaryType || "MONTHLY",
  );
  const [monthlySalary, setMonthlySalary] = useState(
    existingConfig?.monthlySalary?.toString() || "",
  );
  const [dailyRate, setDailyRate] = useState(
    existingConfig?.dailyRate?.toString() || "",
  );
  const [hourlyRate, setHourlyRate] = useState(
    existingConfig?.hourlyRate?.toString() || "",
  );
  const [shiftRate, setShiftRate] = useState(
    existingConfig?.shiftRate?.toString() || "",
  );
  const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>(
    existingConfig?.effectiveFrom
      ? new Date(existingConfig.effectiveFrom)
      : new Date(),
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | undefined>(
    existingConfig?.effectiveTo
      ? new Date(existingConfig.effectiveTo)
      : undefined,
  );
  const [note, setNote] = useState(existingConfig?.note || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validation, setValidation] =
    useState<SalaryConfigValidationResponse | null>(null);

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

  // Lấy amount value dựa trên salary type
  const getAmountValue = (): string => {
    switch (salaryType) {
      case "MONTHLY":
        return monthlySalary;
      case "DAILY":
        return dailyRate;
      case "HOURLY":
        return hourlyRate;
      case "SHIFT_BASED":
        return shiftRate;
      default:
        return monthlySalary;
    }
  };

  const getAmountField = (): string => {
    switch (salaryType) {
      case "MONTHLY":
        return "monthlySalary";
      case "DAILY":
        return "dailyRate";
      case "HOURLY":
        return "hourlyRate";
      case "SHIFT_BASED":
        return "shiftRate";
      default:
        return "monthlySalary";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const amountField = getAmountField();
    const amountValue = getAmountValue();
    if (!amountValue || Number(amountValue) <= 0) {
      newErrors[amountField] = t("validation.amountRequired");
    }
    if (!effectiveFrom) {
      newErrors.effectiveFrom = t("validation.effectiveFromRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildInputData = (): EmployeeSalaryConfigInput => {
    const data: EmployeeSalaryConfigInput = {
      salaryType,
      effectiveFrom: formatDateForApi(effectiveFrom) || "",
      effectiveTo: formatDateForApi(effectiveTo),
      note: note || undefined,
    };
    switch (salaryType) {
      case "MONTHLY":
        data.monthlySalary = Number(monthlySalary);
        break;
      case "DAILY":
        data.dailyRate = Number(dailyRate);
        break;
      case "HOURLY":
        data.hourlyRate = Number(hourlyRate);
        break;
      case "SHIFT_BASED":
        data.shiftRate = Number(shiftRate);
        break;
    }
    return data;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const inputData = buildInputData();
      const validationResult = await validateSalaryConfig(
        employeeId,
        inputData,
      );
      setValidation(validationResult);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error validating salary config:", error);
      setValidation(null);
      setShowConfirmDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const inputData = buildInputData();
      if (isEditing && existingConfig) {
        await updateSalaryConfig(employeeId, existingConfig.id, inputData);
        toast.success(t("updateSuccess"));
      } else {
        await createSalaryConfig(employeeId, inputData);
        toast.success(t("createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving salary config:", error);
      toast.error(isEditing ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    await submitForm();
  };

  const handleAmountChange = (value: string) => {
    switch (salaryType) {
      case "MONTHLY":
        setMonthlySalary(value);
        break;
      case "DAILY":
        setDailyRate(value);
        break;
      case "HOURLY":
        setHourlyRate(value);
        break;
      case "SHIFT_BASED":
        setShiftRate(value);
        break;
    }
    const field = getAmountField();
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getAmountConfig = () => {
    switch (salaryType) {
      case "MONTHLY":
        return {
          label: t("monthlySalary"),
          placeholder: t("monthlySalaryPlaceholder"),
        };
      case "DAILY":
        return {
          label: t("dailyRate"),
          placeholder: t("dailyRatePlaceholder"),
        };
      case "HOURLY":
        return {
          label: t("hourlyRate"),
          placeholder: t("hourlyRatePlaceholder"),
        };
      case "SHIFT_BASED":
        return {
          label: t("shiftRate"),
          placeholder: t("shiftRatePlaceholder"),
        };
      default:
        return {
          label: t("monthlySalary"),
          placeholder: t("monthlySalaryPlaceholder"),
        };
    }
  };

  const amountConfig = getAmountConfig();
  const amountValue = getAmountValue();
  const amountField = getAmountField();

  // Kiểm tra có cảnh báo không
  const hasWarning =
    validation?.affectsCurrentPayroll || validation?.hasOverlappingConfigs;

  return (
    <>
      <div className="space-y-4">
        {/* Salary Type */}
        <div className="space-y-2">
          <Label>{t("salaryType")}</Label>
          <Select
            value={salaryType}
            onValueChange={(v) => setSalaryType(v as SalaryType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("salaryTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SALARY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getSalaryTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>{amountConfig.label}</Label>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>¥</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              type="number"
              value={amountValue}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={amountConfig.placeholder}
              min={0}
              className={errors[amountField] ? "border-destructive" : ""}
            />
          </InputGroup>
          {errors[amountField] && (
            <p className="text-sm text-destructive">{errors[amountField]}</p>
          )}
        </div>

        {/* Effective From */}
        <div className="space-y-2">
          <Label>{t("effectiveFrom")}</Label>
          <DatePicker
            value={effectiveFrom}
            onChange={(v) => {
              setEffectiveFrom(v);
              if (errors.effectiveFrom)
                setErrors((p) => ({ ...p, effectiveFrom: "" }));
            }}
            locale={locale}
            placeholder={t("effectiveFrom")}
            className={`w-full ${errors.effectiveFrom ? "border-destructive" : ""}`}
          />
          {errors.effectiveFrom && (
            <p className="text-sm text-destructive">{errors.effectiveFrom}</p>
          )}
        </div>

        {/* Effective To */}
        <div className="space-y-2">
          <Label>{t("effectiveTo")}</Label>
          <DatePicker
            value={effectiveTo}
            onChange={setEffectiveTo}
            locale={locale}
            placeholder={t("effectiveTo")}
            className="w-full"
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label>{t("note")}</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {tCommon("loading")}
              </>
            ) : (
              tCommon("save")
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {hasWarning ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {t("confirmTitle")}
                </>
              ) : (
                <>
                  <Info className="h-5 w-5 text-primary" />
                  {t("confirmTitle")}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Config Summary */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getSalaryTypeLabel(salaryType)}
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(Number(getAmountValue()))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("effectiveFrom")}
                  </p>
                  <p className="font-medium">
                    {effectiveFrom ? formatDate(effectiveFrom, locale) : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {validation?.hasOverlappingConfigs && (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-sm font-medium text-yellow-600">
                  {t("overlappingWarning")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("overlappingDescription", {
                    count: validation.overlappingConfigsCount,
                  })}
                </p>
              </div>
            )}

            {validation?.affectsCurrentPayroll &&
              validation.currentPayrollPeriod && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                  <p className="text-sm font-medium text-orange-600">
                    {t("affectsPayrollTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("affectsPayrollShort", {
                      period: validation.currentPayrollPeriod,
                    })}
                  </p>
                </div>
              )}

            {!hasWarning && (
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? t("confirmUpdateDescription")
                  : t("confirmCreateDescription")}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              variant={hasWarning ? "default" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  {tCommon("loading")}
                </>
              ) : (
                tCommon("confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

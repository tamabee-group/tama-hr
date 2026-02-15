"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from "@/lib/apis/salary-config-api";
import { formatDateForApi, formatDate } from "@/lib/utils/format-date-time";
import {
  formatCurrency,
  type SupportedLocale,
} from "@/lib/utils/format-currency";

interface SalaryConfigFormDialogProps {
  employeeId: number;
  existingConfig?: EmployeeSalaryConfig | null;
  /** Danh sách tất cả config để tính default effectiveFrom */
  allConfigs?: EmployeeSalaryConfig[];
  /** Ngày chốt công từ company settings (0 = cuối tháng) */
  cutoffDay?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SalaryConfigFormDialog({
  employeeId,
  existingConfig,
  allConfigs = [],
  cutoffDay = 0,
  open,
  onOpenChange,
  onSuccess,
}: SalaryConfigFormDialogProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const isEditing = !!existingConfig;

  // Tính default effectiveFrom cho config mới
  // = ngày tiếp theo của ngày kết thúc lớn nhất, hoặc ngày bắt đầu kỳ lương hiện tại
  const getDefaultEffectiveFrom = (): Date => {
    // Tìm ngày kết thúc lớn nhất trong history
    let maxEffectiveTo: Date | null = null;
    for (const config of allConfigs) {
      if (config.effectiveTo) {
        const effectiveTo = new Date(config.effectiveTo);
        if (!maxEffectiveTo || effectiveTo > maxEffectiveTo) {
          maxEffectiveTo = effectiveTo;
        }
      }
    }

    if (maxEffectiveTo) {
      // Có endDate → trả về ngày tiếp theo
      const nextDay = new Date(maxEffectiveTo);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }

    // Không có endDate → trả về ngày bắt đầu kỳ lương hiện tại
    const today = new Date();
    if (cutoffDay === 0 || cutoffDay >= 28) {
      // Ngày cuối tháng → kỳ lương từ ngày 1
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }
    // cutoffDay = 20 → kỳ lương từ ngày 21 tháng trước
    const startDay = cutoffDay + 1;
    // Nếu hôm nay <= cutoffDay → kỳ lương bắt đầu từ tháng trước
    if (today.getDate() <= cutoffDay) {
      return new Date(today.getFullYear(), today.getMonth() - 1, startDay);
    }
    // Nếu hôm nay > cutoffDay → kỳ lương bắt đầu từ tháng này
    return new Date(today.getFullYear(), today.getMonth(), startDay);
  };

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
      : getDefaultEffectiveFrom(),
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | undefined>(
    existingConfig?.effectiveTo
      ? new Date(existingConfig.effectiveTo)
      : undefined,
  );
  const [note, setNote] = useState(existingConfig?.note || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync form state khi dialog mở hoặc existingConfig thay đổi
  useEffect(() => {
    if (open) {
      setSalaryType(existingConfig?.salaryType || "MONTHLY");
      setMonthlySalary(existingConfig?.monthlySalary?.toString() || "");
      setDailyRate(existingConfig?.dailyRate?.toString() || "");
      setHourlyRate(existingConfig?.hourlyRate?.toString() || "");
      setShiftRate(existingConfig?.shiftRate?.toString() || "");
      setEffectiveFrom(
        existingConfig?.effectiveFrom
          ? new Date(existingConfig.effectiveFrom)
          : getDefaultEffectiveFrom(),
      );
      setEffectiveTo(
        existingConfig?.effectiveTo
          ? new Date(existingConfig.effectiveTo)
          : undefined,
      );
      setNote(existingConfig?.note || "");
      setErrors({});
      setShowConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingConfig]);

  // Reset form khi dialog đóng
  const resetForm = () => {
    setSalaryType(existingConfig?.salaryType || "MONTHLY");
    setMonthlySalary(existingConfig?.monthlySalary?.toString() || "");
    setDailyRate(existingConfig?.dailyRate?.toString() || "");
    setHourlyRate(existingConfig?.hourlyRate?.toString() || "");
    setShiftRate(existingConfig?.shiftRate?.toString() || "");
    setEffectiveFrom(
      existingConfig?.effectiveFrom
        ? new Date(existingConfig.effectiveFrom)
        : getDefaultEffectiveFrom(),
    );
    setEffectiveTo(
      existingConfig?.effectiveTo
        ? new Date(existingConfig.effectiveTo)
        : undefined,
    );
    setNote(existingConfig?.note || "");
    setErrors({});
    setShowConfirm(false);
  };

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
  const getAmountValue = (type: SalaryType = salaryType): string => {
    switch (type) {
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

  // Lấy amount từ config cũ
  const getOldAmount = (): number => {
    if (!existingConfig) return 0;
    switch (existingConfig.salaryType) {
      case "MONTHLY":
        return existingConfig.monthlySalary || 0;
      case "DAILY":
        return existingConfig.dailyRate || 0;
      case "HOURLY":
        return existingConfig.hourlyRate || 0;
      case "SHIFT_BASED":
        return existingConfig.shiftRate || 0;
      default:
        return 0;
    }
  };

  // Kiểm tra có thay đổi gì không khi update
  const hasChanges = (): boolean => {
    if (!existingConfig) return true;

    const oldEffectiveFrom = existingConfig.effectiveFrom;
    const newEffectiveFrom = formatDateForApi(effectiveFrom) || "";
    const oldEffectiveTo = existingConfig.effectiveTo || "";
    const newEffectiveTo = formatDateForApi(effectiveTo) || "";
    const oldNote = existingConfig.note || "";
    const newNote = note || "";

    // So sánh salary type
    if (salaryType !== existingConfig.salaryType) return true;

    // So sánh amount
    if (Number(amountValue) !== getOldAmount()) return true;

    // So sánh ngày hiệu lực
    if (newEffectiveFrom !== oldEffectiveFrom) return true;
    if (newEffectiveTo !== oldEffectiveTo) return true;

    // So sánh ghi chú
    if (newNote !== oldNote) return true;

    return false;
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
    // Validate effectiveTo > effectiveFrom
    if (effectiveFrom && effectiveTo && effectiveTo <= effectiveFrom) {
      newErrors.effectiveTo = t("validation.effectiveToAfterFrom");
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

  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
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
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving salary config:", error);
      toast.error(isEditing ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? t("edit") : t("create")}
          </DialogDescription>
        </DialogHeader>

        {!showConfirm ? (
          // Form nhập liệu
          <div className="space-y-4 py-4">
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

            {/* Ghi chú về loại lương và kỳ lương */}
            <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
                {t("salaryTypeNote")}
              </AlertDescription>
            </Alert>

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
                <p className="text-sm text-destructive">
                  {errors[amountField]}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.effectiveFrom}
                </p>
              )}
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label>{t("effectiveTo")}</Label>
              <DatePicker
                value={effectiveTo}
                onChange={(v) => {
                  setEffectiveTo(v);
                  if (errors.effectiveTo)
                    setErrors((p) => ({ ...p, effectiveTo: "" }));
                }}
                locale={locale}
                placeholder={t("effectiveTo")}
                className={`w-full ${errors.effectiveTo ? "border-destructive" : ""}`}
              />
              {errors.effectiveTo && (
                <p className="text-sm text-destructive">{errors.effectiveTo}</p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>{t("note")}</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notePlaceholder")}
                rows={2}
              />
            </div>
          </div>
        ) : (
          // Xác nhận thay đổi
          <div className="py-4 space-y-4">
            {isEditing && existingConfig ? (
              // So sánh trước/sau khi update
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("compareChanges")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Trước */}
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t("before")}
                    </p>
                    <p className="text-sm">
                      {getSalaryTypeLabel(existingConfig.salaryType)}
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(getOldAmount())}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>
                        {t("effectiveFrom")}:{" "}
                        {formatDate(existingConfig.effectiveFrom, locale)}
                      </p>
                      <p>
                        {t("effectiveTo")}:{" "}
                        {existingConfig.effectiveTo
                          ? formatDate(existingConfig.effectiveTo, locale)
                          : "-"}
                      </p>
                      <p>
                        {t("note")}: {existingConfig.note || "-"}
                      </p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  <div className="flex justify-center sm:hidden">
                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                  </div>
                  {/* Sau */}
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t("after")}
                    </p>
                    <p className="text-sm">{getSalaryTypeLabel(salaryType)}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(Number(amountValue))}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>
                        {t("effectiveFrom")}:{" "}
                        {formatDate(effectiveFrom, locale)}
                      </p>
                      <p>
                        {t("effectiveTo")}:{" "}
                        {effectiveTo ? formatDate(effectiveTo, locale) : "-"}
                      </p>
                      <p>
                        {t("note")}: {note || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Xác nhận tạo mới
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("confirmCreateDescription")}
                </p>
                <p className="font-medium">{getSalaryTypeLabel(salaryType)}</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(Number(amountValue))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("effectiveFrom")}: {formatDate(effectiveFrom, locale)}
                  {effectiveTo && ` → ${formatDate(effectiveTo, locale)}`}
                </p>
                {note && (
                  <p className="text-sm text-muted-foreground">
                    {t("note")}: {note}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showConfirm ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleSubmit}>{tCommon("next")}</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                {tCommon("back")}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting || (isEditing && !hasChanges())}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

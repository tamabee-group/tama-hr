"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
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
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EmployeeDeduction,
  EmployeeDeductionInput,
} from "@/types/attendance-records";
import { DEDUCTION_TYPES, DeductionType } from "@/types/attendance-enums";
import {
  createDeduction,
  updateDeduction,
} from "@/lib/apis/employee-deduction-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDateForApi } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface DeductionAssignmentFormProps {
  employeeId: number;
  existingDeduction?: EmployeeDeduction | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeductionAssignmentForm({
  employeeId,
  existingDeduction,
  onSuccess,
  onCancel,
}: DeductionAssignmentFormProps) {
  const t = useTranslations("deductions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const isEditing = !!existingDeduction;

  const [deductionCode, setDeductionCode] = useState(
    existingDeduction?.deductionCode || "",
  );
  const [deductionName, setDeductionName] = useState(
    existingDeduction?.deductionName || "",
  );
  const [deductionType, setDeductionType] = useState<DeductionType>(
    existingDeduction?.deductionType || "FIXED",
  );
  const [amount, setAmount] = useState(
    existingDeduction?.amount?.toString() || "",
  );
  const [percentage, setPercentage] = useState(
    existingDeduction?.percentage?.toString() || "",
  );
  const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>(
    existingDeduction?.effectiveFrom
      ? new Date(existingDeduction.effectiveFrom)
      : undefined,
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | undefined>(
    existingDeduction?.effectiveTo
      ? new Date(existingDeduction.effectiveTo)
      : undefined,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deductionCode.trim()) {
      newErrors.deductionCode = "Mã khấu trừ là bắt buộc";
    }
    if (!deductionName.trim()) {
      newErrors.deductionName = "Tên khấu trừ là bắt buộc";
    }

    if (deductionType === "FIXED") {
      if (!amount || Number(amount) <= 0) {
        newErrors.amount = "Số tiền phải lớn hơn 0";
      }
    } else if (deductionType === "PERCENTAGE") {
      if (!percentage || Number(percentage) <= 0 || Number(percentage) > 100) {
        newErrors.percentage = "Phần trăm phải từ 0 đến 100";
      }
    }

    if (!effectiveFrom) {
      newErrors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const input: EmployeeDeductionInput = {
        deductionCode,
        deductionName,
        deductionType,
        amount: deductionType === "FIXED" ? Number(amount) : undefined,
        percentage:
          deductionType === "PERCENTAGE" ? Number(percentage) : undefined,
        effectiveFrom: formatDateForApi(effectiveFrom) || "",
        effectiveTo: formatDateForApi(effectiveTo),
      };

      if (isEditing && existingDeduction) {
        await updateDeduction(existingDeduction.id, input);
        toast.success(t("updateSuccess"));
      } else {
        await createDeduction(employeeId, input);
        toast.success(t("createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving deduction:", error);
      toast.error(isEditing ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mã khấu trừ */}
        <div className="space-y-2">
          <Label htmlFor="deductionCode">Mã khấu trừ</Label>
          <Input
            id="deductionCode"
            value={deductionCode}
            onChange={(e) => {
              setDeductionCode(e.target.value);
              if (errors.deductionCode) {
                setErrors((prev) => ({ ...prev, deductionCode: "" }));
              }
            }}
            placeholder="VD: TAX, INSURANCE..."
            className={errors.deductionCode ? "border-destructive" : ""}
          />
          {errors.deductionCode && (
            <p className="text-sm text-destructive">{errors.deductionCode}</p>
          )}
        </div>

        {/* Tên khấu trừ */}
        <div className="space-y-2">
          <Label htmlFor="deductionName">{tCommon("name")}</Label>
          <Input
            id="deductionName"
            value={deductionName}
            onChange={(e) => {
              setDeductionName(e.target.value);
              if (errors.deductionName) {
                setErrors((prev) => ({ ...prev, deductionName: "" }));
              }
            }}
            placeholder="VD: Thuế thu nhập..."
            className={errors.deductionName ? "border-destructive" : ""}
          />
          {errors.deductionName && (
            <p className="text-sm text-destructive">{errors.deductionName}</p>
          )}
        </div>

        {/* Loại khấu trừ */}
        <div className="space-y-2">
          <Label htmlFor="deductionType">{t("deductionType")}</Label>
          <Select
            value={deductionType}
            onValueChange={(value) => setDeductionType(value as DeductionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("deductionTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {DEDUCTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getEnumLabel("deductionType", type, tEnums)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số tiền hoặc Phần trăm dựa trên loại */}
        {deductionType === "FIXED" ? (
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <InputGroup>
              <InputGroupInput
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: "" }));
                  }
                }}
                placeholder={t("amountPlaceholder")}
                className={errors.amount ? "border-destructive" : ""}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>¥</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="percentage">{t("percentage")}</Label>
            <InputGroup>
              <InputGroupInput
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => {
                  setPercentage(e.target.value);
                  if (errors.percentage) {
                    setErrors((prev) => ({ ...prev, percentage: "" }));
                  }
                }}
                placeholder={t("percentagePlaceholder")}
                className={errors.percentage ? "border-destructive" : ""}
                min="0"
                max="100"
                step="0.1"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>%</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.percentage && (
              <p className="text-sm text-destructive">{errors.percentage}</p>
            )}
          </div>
        )}

        {/* Ngày bắt đầu */}
        <div className="space-y-2">
          <Label htmlFor="effectiveFrom">{t("effectiveFrom")}</Label>
          <DatePicker
            value={effectiveFrom}
            onChange={(value) => {
              setEffectiveFrom(value);
              if (errors.effectiveFrom) {
                setErrors((prev) => ({ ...prev, effectiveFrom: "" }));
              }
            }}
            locale={locale}
            placeholder={t("effectiveFrom")}
            className={`w-full ${errors.effectiveFrom ? "border-destructive" : ""}`}
          />
          {errors.effectiveFrom && (
            <p className="text-sm text-destructive">{errors.effectiveFrom}</p>
          )}
        </div>

        {/* Ngày kết thúc */}
        <div className="space-y-2">
          <Label htmlFor="effectiveTo">{t("effectiveTo")}</Label>
          <DatePicker
            value={effectiveTo}
            onChange={setEffectiveTo}
            locale={locale}
            placeholder={t("effectiveTo")}
            className="w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
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
  );
}

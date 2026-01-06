"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  EmployeeAllowance,
  EmployeeAllowanceInput,
} from "@/types/attendance-records";
import { ALLOWANCE_TYPES, AllowanceType } from "@/types/attendance-enums";
import {
  createAllowance,
  updateAllowance,
} from "@/lib/apis/employee-allowance-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDateForApi } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AllowanceAssignmentFormProps {
  employeeId: number;
  existingAllowance?: EmployeeAllowance | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AllowanceAssignmentForm({
  employeeId,
  existingAllowance,
  onSuccess,
  onCancel,
}: AllowanceAssignmentFormProps) {
  const t = useTranslations("allowances");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const isEditing = !!existingAllowance;

  const [allowanceCode, setAllowanceCode] = useState(
    existingAllowance?.allowanceCode || "",
  );
  const [allowanceName, setAllowanceName] = useState(
    existingAllowance?.allowanceName || "",
  );
  const [allowanceType, setAllowanceType] = useState<AllowanceType>(
    existingAllowance?.allowanceType || "FIXED",
  );
  const [amount, setAmount] = useState(
    existingAllowance?.amount?.toString() || "",
  );
  const [taxable, setTaxable] = useState(existingAllowance?.taxable ?? false);
  const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>(
    existingAllowance?.effectiveFrom
      ? new Date(existingAllowance.effectiveFrom)
      : undefined,
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | undefined>(
    existingAllowance?.effectiveTo
      ? new Date(existingAllowance.effectiveTo)
      : undefined,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!allowanceCode.trim()) {
      newErrors.allowanceCode = "Mã phụ cấp là bắt buộc";
    }
    if (!allowanceName.trim()) {
      newErrors.allowanceName = "Tên phụ cấp là bắt buộc";
    }
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
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
      const input: EmployeeAllowanceInput = {
        allowanceCode,
        allowanceName,
        allowanceType,
        amount: Number(amount),
        taxable,
        effectiveFrom: formatDateForApi(effectiveFrom) || "",
        effectiveTo: formatDateForApi(effectiveTo),
      };

      if (isEditing && existingAllowance) {
        await updateAllowance(existingAllowance.id, input);
        toast.success(t("updateSuccess"));
      } else {
        await createAllowance(employeeId, input);
        toast.success(t("createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving allowance:", error);
      toast.error(isEditing ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mã phụ cấp */}
        <div className="space-y-2">
          <Label htmlFor="allowanceCode">Mã phụ cấp</Label>
          <Input
            id="allowanceCode"
            value={allowanceCode}
            onChange={(e) => {
              setAllowanceCode(e.target.value);
              if (errors.allowanceCode) {
                setErrors((prev) => ({ ...prev, allowanceCode: "" }));
              }
            }}
            placeholder="VD: MEAL, TRANSPORT..."
            className={errors.allowanceCode ? "border-destructive" : ""}
          />
          {errors.allowanceCode && (
            <p className="text-sm text-destructive">{errors.allowanceCode}</p>
          )}
        </div>

        {/* Tên phụ cấp */}
        <div className="space-y-2">
          <Label htmlFor="allowanceName">{tCommon("name")}</Label>
          <Input
            id="allowanceName"
            value={allowanceName}
            onChange={(e) => {
              setAllowanceName(e.target.value);
              if (errors.allowanceName) {
                setErrors((prev) => ({ ...prev, allowanceName: "" }));
              }
            }}
            placeholder="VD: Phụ cấp ăn trưa..."
            className={errors.allowanceName ? "border-destructive" : ""}
          />
          {errors.allowanceName && (
            <p className="text-sm text-destructive">{errors.allowanceName}</p>
          )}
        </div>

        {/* Loại phụ cấp */}
        <div className="space-y-2">
          <Label htmlFor="allowanceType">{t("allowanceType")}</Label>
          <Select
            value={allowanceType}
            onValueChange={(value) => setAllowanceType(value as AllowanceType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("allowanceTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {ALLOWANCE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getEnumLabel("allowanceType", type, tEnums)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số tiền */}
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

      {/* Chịu thuế */}
      <div className="flex items-center gap-3">
        <Switch id="taxable" checked={taxable} onCheckedChange={setTaxable} />
        <Label htmlFor="taxable" className="cursor-pointer">
          {t("taxable")}
        </Label>
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

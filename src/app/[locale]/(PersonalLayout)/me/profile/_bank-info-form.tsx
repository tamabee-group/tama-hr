"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Save, Building2, CreditCard, Hash, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";

import {
  type MyProfileResponse,
  updateMyProfile,
} from "@/lib/apis/my-profile-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// ============================================
// Types
// ============================================

interface BankInfoFormProps {
  profile: MyProfileResponse;
  onProfileUpdate: (profile: MyProfileResponse) => void;
}

type BankAccountType = "VN" | "JP";
type JapanBankType = "normal" | "yucho";
type BankAccountCategory = "futsu" | "toza";

interface FormData {
  bankAccountType: BankAccountType | "";
  japanBankType: JapanBankType | "";
  // Common fields
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  // Japan normal bank fields
  bankCode: string;
  bankBranchCode: string;
  bankBranchName: string;
  bankAccountCategory: BankAccountCategory | "";
  // Japan Yucho fields
  bankSymbol: string;
  bankNumber: string;
}

// ============================================
// Main Component
// ============================================

/**
 * BankInfoForm Component
 * Form quản lý thông tin ngân hàng của nhân viên
 *
 * Features:
 * - Chọn loại tài khoản: Vietnam Bank hoặc Japan Bank
 * - Vietnam Bank: bank name, account number, account holder name
 * - Japan Bank: chọn loại Normal Bank hoặc Yucho Bank
 * - Normal Bank: bank name, bank code, branch code, branch name, account number, account holder name, account category
 * - Yucho Bank: symbol (記号), number (番号), account holder name
 * - Validation theo loại ngân hàng đã chọn
 */
export function BankInfoForm({ profile, onProfileUpdate }: BankInfoFormProps) {
  const t = useTranslations("portal");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    bankAccountType: (profile.bankAccountType as BankAccountType) || "",
    japanBankType: (profile.japanBankType as JapanBankType) || "",
    bankName: profile.bankName || "",
    bankAccount: profile.bankAccount || "",
    bankAccountName: profile.bankAccountName || "",
    bankCode: profile.bankCode || "",
    bankBranchCode: profile.bankBranchCode || "",
    bankBranchName: profile.bankBranchName || "",
    bankAccountCategory:
      (profile.bankAccountCategory as BankAccountCategory) || "",
    bankSymbol: profile.bankSymbol || "",
    bankNumber: profile.bankNumber || "",
  });

  // Lưu giá trị ban đầu để so sánh
  const initialData = React.useRef<FormData>({
    bankAccountType: (profile.bankAccountType as BankAccountType) || "",
    japanBankType: (profile.japanBankType as JapanBankType) || "",
    bankName: profile.bankName || "",
    bankAccount: profile.bankAccount || "",
    bankAccountName: profile.bankAccountName || "",
    bankCode: profile.bankCode || "",
    bankBranchCode: profile.bankBranchCode || "",
    bankBranchName: profile.bankBranchName || "",
    bankAccountCategory:
      (profile.bankAccountCategory as BankAccountCategory) || "",
    bankSymbol: profile.bankSymbol || "",
    bankNumber: profile.bankNumber || "",
  });

  // Kiểm tra có thay đổi không
  const hasChanges = React.useMemo(() => {
    const initial = initialData.current;
    return (
      formData.bankAccountType !== initial.bankAccountType ||
      formData.japanBankType !== initial.japanBankType ||
      formData.bankName !== initial.bankName ||
      formData.bankAccount !== initial.bankAccount ||
      formData.bankAccountName !== initial.bankAccountName ||
      formData.bankCode !== initial.bankCode ||
      formData.bankBranchCode !== initial.bankBranchCode ||
      formData.bankBranchName !== initial.bankBranchName ||
      formData.bankAccountCategory !== initial.bankAccountCategory ||
      formData.bankSymbol !== initial.bankSymbol ||
      formData.bankNumber !== initial.bankNumber
    );
  }, [formData]);

  // UI state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // ============================================
  // Validation
  // ============================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nếu chưa chọn loại tài khoản thì không cần validate
    if (!formData.bankAccountType) {
      setErrors(newErrors);
      return true;
    }

    // Validate Vietnam Bank
    if (formData.bankAccountType === "VN") {
      if (!formData.bankName.trim()) {
        newErrors.bankName = tValidation("required");
      }
      if (!formData.bankAccount.trim()) {
        newErrors.bankAccount = tValidation("required");
      }
      if (!formData.bankAccountName.trim()) {
        newErrors.bankAccountName = tValidation("required");
      }
    }

    // Validate Japan Bank
    if (formData.bankAccountType === "JP") {
      if (!formData.japanBankType) {
        newErrors.japanBankType = tValidation("required");
      }

      // Validate Normal Bank
      if (formData.japanBankType === "normal") {
        if (!formData.bankName.trim()) {
          newErrors.bankName = tValidation("required");
        }
        if (!formData.bankCode.trim()) {
          newErrors.bankCode = tValidation("required");
        }
        if (!formData.bankBranchCode.trim()) {
          newErrors.bankBranchCode = tValidation("required");
        }
        if (!formData.bankBranchName.trim()) {
          newErrors.bankBranchName = tValidation("required");
        }
        if (!formData.bankAccount.trim()) {
          newErrors.bankAccount = tValidation("required");
        }
        if (!formData.bankAccountName.trim()) {
          newErrors.bankAccountName = tValidation("required");
        }
        if (!formData.bankAccountCategory) {
          newErrors.bankAccountCategory = tValidation("required");
        }
      }

      // Validate Yucho Bank
      if (formData.japanBankType === "yucho") {
        if (!formData.bankSymbol.trim()) {
          newErrors.bankSymbol = tValidation("required");
        }
        if (!formData.bankNumber.trim()) {
          newErrors.bankNumber = tValidation("required");
        }
        if (!formData.bankAccountName.trim()) {
          newErrors.bankAccountName = tValidation("required");
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Handlers
  // ============================================

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error khi user bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBankTypeChange = (value: BankAccountType) => {
    // Reset các field khi đổi loại ngân hàng
    setFormData((prev) => ({
      ...prev,
      bankAccountType: value,
      japanBankType: "",
      bankName: "",
      bankAccount: "",
      bankAccountName: "",
      bankCode: "",
      bankBranchCode: "",
      bankBranchName: "",
      bankAccountCategory: "",
      bankSymbol: "",
      bankNumber: "",
    }));
    setErrors({});
  };

  const handleJapanBankTypeChange = (value: JapanBankType) => {
    // Reset các field khi đổi loại ngân hàng Nhật
    setFormData((prev) => ({
      ...prev,
      japanBankType: value,
      bankName: "",
      bankAccount: "",
      bankAccountName: "",
      bankCode: "",
      bankBranchCode: "",
      bankBranchName: "",
      bankAccountCategory: "",
      bankSymbol: "",
      bankNumber: "",
    }));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await updateMyProfile({
        bankAccountType: formData.bankAccountType || undefined,
        japanBankType: formData.japanBankType || undefined,
        bankName: formData.bankName.trim() || undefined,
        bankAccount: formData.bankAccount.trim() || undefined,
        bankAccountName: formData.bankAccountName.trim() || undefined,
        bankCode: formData.bankCode.trim() || undefined,
        bankBranchCode: formData.bankBranchCode.trim() || undefined,
        bankBranchName: formData.bankBranchName.trim() || undefined,
        bankAccountCategory: formData.bankAccountCategory || undefined,
        bankSymbol: formData.bankSymbol.trim() || undefined,
        bankNumber: formData.bankNumber.trim() || undefined,
      });

      onProfileUpdate(updatedProfile);
      toast.success(t("profile.messages.saveSuccess"));
      setErrors({});
      // Cập nhật initial data sau khi save thành công
      initialData.current = { ...formData };
    } catch (error) {
      console.error("Lỗi cập nhật thông tin ngân hàng:", error);
      const message = getErrorMessage(
        error,
        tErrors,
        t("profile.messages.saveError"),
      );
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // Render Helpers
  // ============================================

  // Render Vietnam Bank fields
  const renderVietnamBankFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name */}
      <div>
        <Label htmlFor="bankName">
          {t("profile.bankInfo.bankName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankName"
          value={formData.bankName}
          onChange={(e) => handleFieldChange("bankName", e.target.value)}
          onClear={() => handleFieldChange("bankName", "")}
          placeholder={t("profile.bankInfo.placeholders.bankName")}
          icon={<Building2 className="h-4 w-4" />}
          aria-invalid={!!errors.bankName}
        />
        {errors.bankName && (
          <p className="text-sm text-destructive mt-1">{errors.bankName}</p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <Label htmlFor="bankAccount">
          {t("profile.bankInfo.accountNumber")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankAccount"
          value={formData.bankAccount}
          onChange={(e) => handleFieldChange("bankAccount", e.target.value)}
          onClear={() => handleFieldChange("bankAccount", "")}
          placeholder={t("profile.bankInfo.placeholders.accountNumber")}
          icon={<CreditCard className="h-4 w-4" />}
          aria-invalid={!!errors.bankAccount}
        />
        {errors.bankAccount && (
          <p className="text-sm text-destructive mt-1">{errors.bankAccount}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div className="md:col-span-2">
        <Label htmlFor="bankAccountName">
          {t("profile.bankInfo.accountHolderName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankAccountName"
          value={formData.bankAccountName}
          onChange={(e) => handleFieldChange("bankAccountName", e.target.value)}
          onClear={() => handleFieldChange("bankAccountName", "")}
          placeholder={t("profile.bankInfo.placeholders.accountHolderName")}
          icon={<User className="h-4 w-4" />}
          textTransform="uppercase"
          aria-invalid={!!errors.bankAccountName}
        />
        {errors.bankAccountName && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankAccountName}
          </p>
        )}
      </div>
    </div>
  );

  // Render Japan Normal Bank fields
  const renderJapanNormalBankFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name */}
      <div>
        <Label htmlFor="bankName">
          {t("profile.bankInfo.bankName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankName"
          value={formData.bankName}
          onChange={(e) => handleFieldChange("bankName", e.target.value)}
          onClear={() => handleFieldChange("bankName", "")}
          placeholder={t("profile.bankInfo.placeholders.bankName")}
          icon={<Building2 className="h-4 w-4" />}
          aria-invalid={!!errors.bankName}
        />
        {errors.bankName && (
          <p className="text-sm text-destructive mt-1">{errors.bankName}</p>
        )}
      </div>

      {/* Bank Code */}
      <div>
        <Label htmlFor="bankCode">
          {t("profile.bankInfo.bankCode")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankCode"
          value={formData.bankCode}
          onChange={(e) => handleFieldChange("bankCode", e.target.value)}
          onClear={() => handleFieldChange("bankCode", "")}
          placeholder={t("profile.bankInfo.placeholders.bankCode")}
          icon={<Hash className="h-4 w-4" />}
          aria-invalid={!!errors.bankCode}
        />
        {errors.bankCode && (
          <p className="text-sm text-destructive mt-1">{errors.bankCode}</p>
        )}
      </div>

      {/* Branch Name */}
      <div>
        <Label htmlFor="bankBranchName">
          {t("profile.bankInfo.branchName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankBranchName"
          value={formData.bankBranchName}
          onChange={(e) => handleFieldChange("bankBranchName", e.target.value)}
          onClear={() => handleFieldChange("bankBranchName", "")}
          placeholder={t("profile.bankInfo.placeholders.branchName")}
          icon={<Building2 className="h-4 w-4" />}
          aria-invalid={!!errors.bankBranchName}
        />
        {errors.bankBranchName && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankBranchName}
          </p>
        )}
      </div>

      {/* Branch Code */}
      <div>
        <Label htmlFor="bankBranchCode">
          {t("profile.bankInfo.branchCode")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankBranchCode"
          value={formData.bankBranchCode}
          onChange={(e) => handleFieldChange("bankBranchCode", e.target.value)}
          onClear={() => handleFieldChange("bankBranchCode", "")}
          placeholder={t("profile.bankInfo.placeholders.branchCode")}
          icon={<Hash className="h-4 w-4" />}
          aria-invalid={!!errors.bankBranchCode}
        />
        {errors.bankBranchCode && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankBranchCode}
          </p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <Label htmlFor="bankAccount">
          {t("profile.bankInfo.accountNumber")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankAccount"
          value={formData.bankAccount}
          onChange={(e) => handleFieldChange("bankAccount", e.target.value)}
          onClear={() => handleFieldChange("bankAccount", "")}
          placeholder={t("profile.bankInfo.placeholders.accountNumber")}
          icon={<CreditCard className="h-4 w-4" />}
          aria-invalid={!!errors.bankAccount}
        />
        {errors.bankAccount && (
          <p className="text-sm text-destructive mt-1">{errors.bankAccount}</p>
        )}
      </div>

      {/* Account Category */}
      <div>
        <Label>
          {t("profile.bankInfo.accountCategory")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.bankAccountCategory}
          onValueChange={(value) =>
            handleFieldChange("bankAccountCategory", value)
          }
        >
          <SelectTrigger
            aria-label={t("profile.bankInfo.accountCategory")}
            aria-invalid={!!errors.bankAccountCategory}
          >
            <SelectValue
              placeholder={t("profile.bankInfo.placeholders.selectCategory")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="futsu">
              {t("profile.bankInfo.categories.futsu")}
            </SelectItem>
            <SelectItem value="toza">
              {t("profile.bankInfo.categories.toza")}
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.bankAccountCategory && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankAccountCategory}
          </p>
        )}
      </div>

      {/* Account Holder Name */}
      <div className="md:col-span-2">
        <Label htmlFor="bankAccountName">
          {t("profile.bankInfo.accountHolderName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankAccountName"
          value={formData.bankAccountName}
          onChange={(e) => handleFieldChange("bankAccountName", e.target.value)}
          onClear={() => handleFieldChange("bankAccountName", "")}
          placeholder={t("profile.bankInfo.placeholders.accountHolderName")}
          icon={<User className="h-4 w-4" />}
          textTransform="uppercase"
          aria-invalid={!!errors.bankAccountName}
        />
        {errors.bankAccountName && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankAccountName}
          </p>
        )}
      </div>
    </div>
  );

  // Render Japan Yucho Bank fields
  const renderJapanYuchoBankFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Symbol (記号) */}
      <div>
        <Label htmlFor="bankSymbol">
          {t("profile.bankInfo.symbol")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankSymbol"
          value={formData.bankSymbol}
          onChange={(e) => handleFieldChange("bankSymbol", e.target.value)}
          onClear={() => handleFieldChange("bankSymbol", "")}
          placeholder={t("profile.bankInfo.placeholders.symbol")}
          icon={<Hash className="h-4 w-4" />}
          aria-invalid={!!errors.bankSymbol}
        />
        {errors.bankSymbol && (
          <p className="text-sm text-destructive mt-1">{errors.bankSymbol}</p>
        )}
      </div>

      {/* Number (番号) */}
      <div>
        <Label htmlFor="bankNumber">
          {t("profile.bankInfo.number")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankNumber"
          value={formData.bankNumber}
          onChange={(e) => handleFieldChange("bankNumber", e.target.value)}
          onClear={() => handleFieldChange("bankNumber", "")}
          placeholder={t("profile.bankInfo.placeholders.number")}
          icon={<Hash className="h-4 w-4" />}
          aria-invalid={!!errors.bankNumber}
        />
        {errors.bankNumber && (
          <p className="text-sm text-destructive mt-1">{errors.bankNumber}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div className="md:col-span-2">
        <Label htmlFor="bankAccountName">
          {t("profile.bankInfo.accountHolderName")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <ClearableInput
          id="bankAccountName"
          value={formData.bankAccountName}
          onChange={(e) => handleFieldChange("bankAccountName", e.target.value)}
          onClear={() => handleFieldChange("bankAccountName", "")}
          placeholder={t("profile.bankInfo.placeholders.accountHolderName")}
          icon={<User className="h-4 w-4" />}
          textTransform="uppercase"
          aria-invalid={!!errors.bankAccountName}
        />
        {errors.bankAccountName && (
          <p className="text-sm text-destructive mt-1">
            {errors.bankAccountName}
          </p>
        )}
      </div>
    </div>
  );

  // ============================================
  // Render
  // ============================================

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Account Type Selector */}
        <div>
          <Label>{t("profile.bankInfo.accountType")}</Label>
          <Select
            value={formData.bankAccountType}
            onValueChange={(value) =>
              handleBankTypeChange(value as BankAccountType)
            }
          >
            <SelectTrigger aria-label={t("profile.bankInfo.accountType")}>
              <SelectValue
                placeholder={t(
                  "profile.bankInfo.placeholders.selectAccountType",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VN">
                {t("profile.bankInfo.types.vietnam")}
              </SelectItem>
              <SelectItem value="JP">
                {t("profile.bankInfo.types.japan")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Japan Bank Type Selector (chỉ hiển thị khi chọn Japan Bank) */}
        {formData.bankAccountType === "JP" && (
          <div>
            <Label>
              {t("profile.bankInfo.japanBankType")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.japanBankType}
              onValueChange={(value) =>
                handleJapanBankTypeChange(value as JapanBankType)
              }
            >
              <SelectTrigger
                aria-label={t("profile.bankInfo.japanBankType")}
                aria-invalid={!!errors.japanBankType}
              >
                <SelectValue
                  placeholder={t(
                    "profile.bankInfo.placeholders.selectJapanBankType",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">
                  {t("profile.bankInfo.japanTypes.normal")}
                </SelectItem>
                <SelectItem value="yucho">
                  {t("profile.bankInfo.japanTypes.yucho")}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.japanBankType && (
              <p className="text-sm text-destructive mt-1">
                {errors.japanBankType}
              </p>
            )}
          </div>
        )}

        {/* Conditional Fields */}
        {formData.bankAccountType === "VN" && renderVietnamBankFields()}
        {formData.bankAccountType === "JP" &&
          formData.japanBankType === "normal" &&
          renderJapanNormalBankFields()}
        {formData.bankAccountType === "JP" &&
          formData.japanBankType === "yucho" &&
          renderJapanYuchoBankFields()}

        {/* Submit button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Spinner className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? tCommon("loading") : t("profile.actions.save")}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

// ============================================
// Exports
// ============================================

export type { BankInfoFormProps };

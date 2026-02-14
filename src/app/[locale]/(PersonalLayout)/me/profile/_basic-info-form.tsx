"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Save, Mail, Phone, MapPin, Milestone } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/spinner";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { AvatarUpload } from "./_avatar-upload";

import {
  type MyProfileResponse,
  updateMyProfile,
  uploadAvatar,
} from "@/lib/apis/my-profile-api";
import { type Gender, GENDERS } from "@/types/enums";
import { getGenderLabel } from "@/lib/utils/get-enum-label";
import { formatDateForApi } from "@/lib/utils/format-date-time";
import { useZipcode } from "@/hooks/use-zipcode";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// ============================================
// Types
// ============================================

interface BasicInfoFormProps {
  profile: MyProfileResponse;
  onProfileUpdate: (profile: MyProfileResponse) => void;
}

interface FormData {
  name: string;
  phone: string;
  dateOfBirth: Date | undefined;
  gender: Gender | "";
  address: string;
  zipCode: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Chuyển đổi string date từ API sang Date object
 */
function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

// ============================================
// Main Component
// ============================================

/**
 * BasicInfoForm Component
 * Form chỉnh sửa thông tin cơ bản của nhân viên
 *
 * Features:
 * - Avatar upload với crop và compress
 * - Các field: name (required), email (readonly), phone, DOB, gender, address, zipCode
 * - Validation trước khi submit
 * - Hiển thị toast success/error
 * - Loading state khi save
 */
export function BasicInfoForm({
  profile,
  onProfileUpdate,
}: BasicInfoFormProps) {
  const t = useTranslations("portal");
  const tEnums = useTranslations("enums");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    name: profile.name || "",
    phone: profile.phone || "",
    dateOfBirth: parseDate(profile.dateOfBirth),
    gender: (profile.gender as Gender) || "",
    address: profile.address || "",
    zipCode: profile.zipCode || "",
  });

  // Lưu giá trị ban đầu để so sánh
  const initialData = React.useRef<FormData>({
    name: profile.name || "",
    phone: profile.phone || "",
    dateOfBirth: parseDate(profile.dateOfBirth),
    gender: (profile.gender as Gender) || "",
    address: profile.address || "",
    zipCode: profile.zipCode || "",
  });

  // Kiểm tra có thay đổi không
  const hasChanges = React.useMemo(() => {
    const initial = initialData.current;
    return (
      formData.name !== initial.name ||
      formData.phone !== initial.phone ||
      formData.dateOfBirth?.getTime() !== initial.dateOfBirth?.getTime() ||
      formData.gender !== initial.gender ||
      formData.address !== initial.address ||
      formData.zipCode !== initial.zipCode
    );
  }, [formData]);

  // UI state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [avatarKey, setAvatarKey] = React.useState(0);

  // Zipcode lookup hook
  const { address: autoAddress, loading: zipLoading } = useZipcode(
    formData.zipCode,
  );

  // Tự động điền địa chỉ khi nhập mã bưu điện
  React.useEffect(() => {
    if (autoAddress) {
      setFormData((prev) => ({ ...prev, address: autoAddress }));
    }
  }, [autoAddress]);

  // ============================================
  // Validation
  // ============================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name là required
    if (!formData.name.trim()) {
      newErrors.name = tValidation("required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Handlers
  // ============================================

  /**
   * Xử lý khi avatar được thay đổi
   */
  const handleAvatarChange = async (file: File) => {
    try {
      const result = await uploadAvatar(file);
      // Cập nhật profile với avatar mới
      onProfileUpdate({ ...profile, avatar: result.avatarUrl });
      // Force refresh avatar image
      setAvatarKey((prev) => prev + 1);
      toast.success(t("profile.messages.saveSuccess"));
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      const message = getErrorMessage(
        error,
        tErrors,
        t("profile.messages.saveError"),
      );
      toast.error(message);
    }
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await updateMyProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formatDateForApi(formData.dateOfBirth),
        gender: formData.gender || undefined,
        address: formData.address.trim() || undefined,
        zipCode: formData.zipCode.trim() || undefined,
      });

      onProfileUpdate(updatedProfile);
      toast.success(t("profile.messages.saveSuccess"));
      setErrors({});
      // Cập nhật initial data sau khi save thành công
      initialData.current = { ...formData };
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
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
  // Render
  // ============================================

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar section */}
        <div className="flex flex-col items-center gap-4">
          <AvatarUpload
            currentAvatar={profile.avatar}
            onAvatarChange={handleAvatarChange}
            userName={profile.name}
            avatarKey={avatarKey}
          />
          <p className="text-sm text-muted-foreground">
            {t("profile.fields.avatar")}
          </p>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name - Required */}
          <div>
            <Label htmlFor="name">
              {t("profile.fields.name")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <ClearableInput
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, name: "" }))}
              placeholder={t("profile.placeholders.name")}
              textTransform="words"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email - Readonly */}
          <div>
            <Label htmlFor="email">{t("profile.fields.email")}</Label>
            <ClearableInput
              id="email"
              value={profile.email}
              onChange={() => {}}
              onClear={() => {}}
              disabled
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">{t("profile.fields.phone")}</Label>
            <ClearableInput
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, phone: "" }))}
              placeholder={t("profile.placeholders.phone")}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label>{t("profile.fields.dob")}</Label>
            <DatePicker
              value={formData.dateOfBirth}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dateOfBirth: date }))
              }
              placeholder={t("profile.placeholders.selectDob")}
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <Label>{t("profile.fields.gender")}</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, gender: value as Gender }))
              }
            >
              <SelectTrigger aria-label={t("profile.fields.gender")}>
                <SelectValue
                  placeholder={t("profile.placeholders.selectGender")}
                />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {getGenderLabel(gender, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zip Code */}
          <div>
            <Label htmlFor="zipCode">{t("profile.fields.zipCode")}</Label>
            <ClearableInput
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, zipCode: "" }))}
              placeholder={t("profile.placeholders.zipCode")}
              icon={
                zipLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Milestone className="h-4 w-4" />
                )
              }
            />
          </div>

          {/* Address - Full width */}
          <div className="md:col-span-2">
            <Label htmlFor="address">{t("profile.fields.address")}</Label>
            <ClearableInput
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, address: "" }))}
              placeholder={t("profile.placeholders.address")}
              icon={<MapPin className="h-4 w-4" />}
              disabled={zipLoading}
            />
          </div>
        </div>

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

export type { BasicInfoFormProps };

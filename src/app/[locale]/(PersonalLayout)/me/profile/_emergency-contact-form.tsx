"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Save, User, Phone, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
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

interface EmergencyContactFormProps {
  profile: MyProfileResponse;
  onProfileUpdate: (profile: MyProfileResponse) => void;
}

interface FormData {
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

// ============================================
// Main Component
// ============================================

/**
 * EmergencyContactForm Component
 * Form quản lý thông tin liên hệ khẩn cấp của nhân viên
 *
 * Features:
 * - Các field: contact name, phone, relationship, address
 * - Save functionality với toast messages
 * - Loading state khi save
 */
export function EmergencyContactForm({
  profile,
  onProfileUpdate,
}: EmergencyContactFormProps) {
  const t = useTranslations("portal");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    emergencyContactName: profile.emergencyContactName || "",
    emergencyContactPhone: profile.emergencyContactPhone || "",
    emergencyContactRelation: profile.emergencyContactRelation || "",
    emergencyContactAddress: profile.emergencyContactAddress || "",
  });

  // Lưu giá trị ban đầu để so sánh
  const initialData = React.useRef<FormData>({
    emergencyContactName: profile.emergencyContactName || "",
    emergencyContactPhone: profile.emergencyContactPhone || "",
    emergencyContactRelation: profile.emergencyContactRelation || "",
    emergencyContactAddress: profile.emergencyContactAddress || "",
  });

  // Kiểm tra có thay đổi không
  const hasChanges = React.useMemo(() => {
    const initial = initialData.current;
    return (
      formData.emergencyContactName !== initial.emergencyContactName ||
      formData.emergencyContactPhone !== initial.emergencyContactPhone ||
      formData.emergencyContactRelation !== initial.emergencyContactRelation ||
      formData.emergencyContactAddress !== initial.emergencyContactAddress
    );
  }, [formData]);

  // UI state
  const [isSaving, setIsSaving] = React.useState(false);

  // ============================================
  // Handlers
  // ============================================

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const updatedProfile = await updateMyProfile({
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone:
          formData.emergencyContactPhone.trim() || undefined,
        emergencyContactRelation:
          formData.emergencyContactRelation.trim() || undefined,
        emergencyContactAddress:
          formData.emergencyContactAddress.trim() || undefined,
      });

      onProfileUpdate(updatedProfile);
      toast.success(t("profile.messages.saveSuccess"));
      // Cập nhật initial data sau khi save thành công
      initialData.current = { ...formData };
    } catch (error) {
      console.error("Lỗi cập nhật thông tin liên hệ khẩn cấp:", error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Name */}
          <div>
            <Label htmlFor="emergencyContactName">
              {t("profile.emergencyContact.contactName")}
            </Label>
            <ClearableInput
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) =>
                handleFieldChange("emergencyContactName", e.target.value)
              }
              onClear={() => handleFieldChange("emergencyContactName", "")}
              placeholder={t(
                "profile.emergencyContact.placeholders.contactName",
              )}
              icon={<User className="h-4 w-4" />}
              textTransform="words"
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="emergencyContactPhone">
              {t("profile.emergencyContact.phone")}
            </Label>
            <ClearableInput
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) =>
                handleFieldChange("emergencyContactPhone", e.target.value)
              }
              onClear={() => handleFieldChange("emergencyContactPhone", "")}
              placeholder={t("profile.emergencyContact.placeholders.phone")}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          {/* Relationship */}
          <div>
            <Label htmlFor="emergencyContactRelation">
              {t("profile.emergencyContact.relationship")}
            </Label>
            <ClearableInput
              id="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={(e) =>
                handleFieldChange("emergencyContactRelation", e.target.value)
              }
              onClear={() => handleFieldChange("emergencyContactRelation", "")}
              placeholder={t(
                "profile.emergencyContact.placeholders.relationship",
              )}
              icon={<Heart className="h-4 w-4" />}
            />
          </div>

          {/* Address - Full width */}
          <div className="md:col-span-2">
            <Label htmlFor="emergencyContactAddress">
              {t("profile.emergencyContact.address")}
            </Label>
            <ClearableInput
              id="emergencyContactAddress"
              value={formData.emergencyContactAddress}
              onChange={(e) =>
                handleFieldChange("emergencyContactAddress", e.target.value)
              }
              onClear={() => handleFieldChange("emergencyContactAddress", "")}
              placeholder={t("profile.emergencyContact.placeholders.address")}
              icon={<MapPin className="h-4 w-4" />}
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

export type { EmergencyContactFormProps };

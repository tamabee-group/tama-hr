"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface EmergencyContactFormData {
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

interface EmergencyContactFormProps {
  data: EmergencyContactFormData;
  onChange: (data: Partial<EmergencyContactFormData>) => void;
  isEditing: boolean;
  errors?: Record<string, string>;
}

/**
 * Form thông tin liên lạc khẩn cấp
 */
export function EmergencyContactForm({
  data,
  onChange,
  isEditing,
  errors,
}: EmergencyContactFormProps) {
  const t = useTranslations("users.emergencyContact");

  return (
    <div className="border-t pt-4 sm:border sm:rounded-lg sm:p-4 space-y-4">
      <h3 className="font-semibold text-sm">{t("title")}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs">{t("name")}</Label>
          <Input
            value={data.emergencyContactName}
            onChange={(e) => onChange({ emergencyContactName: e.target.value })}
            disabled={!isEditing}
            placeholder={t("namePlaceholder")}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">
            {t("relation")}
          </Label>
          <Input
            value={data.emergencyContactRelation}
            onChange={(e) =>
              onChange({ emergencyContactRelation: e.target.value })
            }
            disabled={!isEditing}
            placeholder={t("relationPlaceholder")}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">{t("phone")}</Label>
        <Input
          value={data.emergencyContactPhone}
          onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
          disabled={!isEditing}
          placeholder={t("phonePlaceholder")}
          className="mt-1"
        />
        {errors?.emergencyContactPhone && (
          <p className="text-sm text-destructive mt-1">
            {errors.emergencyContactPhone}
          </p>
        )}
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">{t("address")}</Label>
        <Input
          value={data.emergencyContactAddress}
          onChange={(e) =>
            onChange({ emergencyContactAddress: e.target.value })
          }
          disabled={!isEditing}
          placeholder={t("addressPlaceholder")}
          className="mt-1"
        />
      </div>
    </div>
  );
}

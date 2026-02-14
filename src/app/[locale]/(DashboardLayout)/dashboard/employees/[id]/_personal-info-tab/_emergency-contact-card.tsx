"use client";

import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { EmergencyContactSection } from "@/types/employee-detail";
import { Pencil } from "lucide-react";

interface EmergencyContactCardProps {
  emergencyContact?: EmergencyContactSection;
  onEdit?: () => void;
}

// Info row component
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between py-2 md:border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export function EmergencyContactCard({
  emergencyContact,
  onEdit,
}: EmergencyContactCardProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");

  return (
    <GlassSection>
      {/* Header với title và action button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("emergencyContact")}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          {tCommon("edit")}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-x-8 md:grid-cols-2">
        <InfoRow label={tCommon("name")} value={emergencyContact?.name} />
        <InfoRow label={tCommon("phone")} value={emergencyContact?.phone} />
        <InfoRow
          label={tCommon("relation")}
          value={emergencyContact?.relation}
        />
        <InfoRow label={tCommon("address")} value={emergencyContact?.address} />
      </div>
    </GlassSection>
  );
}

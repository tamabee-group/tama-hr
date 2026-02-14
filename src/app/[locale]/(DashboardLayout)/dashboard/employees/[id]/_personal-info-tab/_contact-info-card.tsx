"use client";

import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { ContactInfoSection } from "@/types/employee-detail";
import { Pencil } from "lucide-react";

interface ContactInfoCardProps {
  contactInfo?: ContactInfoSection;
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

export function ContactInfoCard({ contactInfo, onEdit }: ContactInfoCardProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");

  return (
    <GlassSection>
      {/* Header với title và action button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("contactInfo")}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          {tCommon("edit")}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-x-8 md:grid-cols-2">
        <InfoRow label={tCommon("phone")} value={contactInfo?.phone} />
        <InfoRow label={tCommon("email")} value={contactInfo?.email} />
        <InfoRow label={tCommon("zipCode")} value={contactInfo?.zipCode} />
        <InfoRow label={tCommon("address")} value={contactInfo?.address} />
      </div>
    </GlassSection>
  );
}

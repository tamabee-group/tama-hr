"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{t("contactInfo")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            {tCommon("edit")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid gap-x-8 md:grid-cols-2">
          <InfoRow label={tCommon("phone")} value={contactInfo?.phone} />
          <InfoRow label={tCommon("email")} value={contactInfo?.email} />
          <InfoRow label={tCommon("zipCode")} value={contactInfo?.zipCode} />
          <InfoRow label={tCommon("address")} value={contactInfo?.address} />
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{t("emergencyContact")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            {tCommon("edit")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid gap-x-8 md:grid-cols-2">
          <InfoRow label={tCommon("name")} value={emergencyContact?.name} />
          <InfoRow label={tCommon("phone")} value={emergencyContact?.phone} />
          <InfoRow
            label={tCommon("relation")}
            value={emergencyContact?.relation}
          />
          <InfoRow
            label={tCommon("address")}
            value={emergencyContact?.address}
          />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { WorkInfoSection } from "@/types/employee-detail";
import { formatDate } from "@/lib/utils/format-date-time";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { Pencil } from "lucide-react";
import { EditWorkInfoDialog } from "./_edit-work-info-dialog";
import { UpdateCompanyEmployeeRequest } from "@/lib/apis/company-employees";

interface WorkInfoCardProps {
  workInfo?: WorkInfoSection;
  onUpdate: (data: UpdateCompanyEmployeeRequest) => Promise<boolean>;
}

// Info row component
function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-2 md:border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value || "-"}</span>}
    </div>
  );
}

export function WorkInfoCard({ workInfo, onUpdate }: WorkInfoCardProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <GlassSection>
        {/* Header với title và action button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {t("workInfo")}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            {tCommon("edit")}
          </Button>
        </div>

        {/* Content */}
        <div className="grid gap-x-8 md:grid-cols-2">
          <InfoRow label={tCommon("jobTitle")} value={workInfo?.jobTitle} />
          <InfoRow label={tCommon("department")} value={workInfo?.department} />
          <InfoRow label={tCommon("directManager")}>
            {workInfo?.directManager ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {workInfo.directManager.avatar && (
                    <AvatarImage
                      src={workInfo.directManager.avatar}
                      alt={workInfo.directManager.name}
                    />
                  )}
                  <AvatarFallback />
                </Avatar>
                <span className="text-sm font-medium">
                  {workInfo.directManager.name}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium">-</span>
            )}
          </InfoRow>
          <InfoRow
            label={tCommon("employmentType")}
            value={
              workInfo?.employmentType
                ? tEnums(`contractType.${workInfo.employmentType}`)
                : undefined
            }
          />
          <InfoRow
            label={tCommon("joiningDate")}
            value={formatDate(workInfo?.joiningDate, locale)}
          />
          <InfoRow
            label={tCommon("workLocation")}
            value={workInfo?.workLocation}
          />
        </div>
      </GlassSection>

      <EditWorkInfoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workInfo={workInfo}
        onSave={onUpdate}
      />
    </>
  );
}

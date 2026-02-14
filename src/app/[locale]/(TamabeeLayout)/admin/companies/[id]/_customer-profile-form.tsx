"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { CompanyDetailCard } from "@/app/[locale]/_components/company";
import { Company } from "@/types/company";
import { updateCompany, uploadCompanyLogo } from "@/lib/apis/admin-companies";
import { DeleteCompanyDialog } from "./_delete-company-dialog";
import { Trash2, Hash } from "lucide-react";

interface CustomerProfileFormProps {
  company: Company;
}

export function CustomerProfileForm({ company }: CustomerProfileFormProps) {
  const t = useTranslations("companies");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = async (
    data: {
      name: string;
      ownerName: string;
      email: string;
      phone: string;
      industry: string;
      zipcode: string;
      address: string;
      locale: string;
      language: string;
    },
    logoFile: File | null,
  ) => {
    if (logoFile) {
      await uploadCompanyLogo(company.id, logoFile);
    }
    await updateCompany(company.id, data);
  };

  return (
    <>
      <div className="space-y-6">
        <BackButton />
        <CompanyDetailCard
          company={company}
          canEdit={true}
          showWalletButton={false}
          onSave={handleSave}
        >
          {/* Referral Info */}
          {(company.referredByEmployeeCode ||
            company.referredByEmployeeName) && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 flex items-center gap-4 text-sm mb-3">
              <Hash className="h-4 w-4 text-amber-600" />
              <div className="flex gap-4">
                {company.referredByEmployeeCode && (
                  <span>
                    <span className="text-muted-foreground">
                      {t("form.referralCode")}:
                    </span>{" "}
                    <span className="font-mono font-medium">
                      {company.referredByEmployeeCode}
                    </span>
                  </span>
                )}
                {company.referredByEmployeeName && (
                  <span>
                    <span className="text-muted-foreground">
                      {t("form.referredBy")}:
                    </span>{" "}
                    <span className="font-medium">
                      {company.referredByEmployeeName}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Delete Button - ẩn với Tamabee company (id=0) */}
          {company.id !== 0 && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("deleteDialog.button")}
              </Button>
            </div>
          )}
        </CompanyDetailCard>
      </div>

      <DeleteCompanyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        companyId={company.id}
        companyName={company.name}
      />
    </>
  );
}

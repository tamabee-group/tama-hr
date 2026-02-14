"use client";

import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { BankDetailsSection } from "@/types/employee-detail";
import { Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface BankDetailsCardProps {
  bankDetails?: BankDetailsSection;
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

export function BankDetailsCard({ bankDetails, onEdit }: BankDetailsCardProps) {
  const t = useTranslations("employeeDetail.personalInfo");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  // Xác định loại ngân hàng theo locale của user
  const isJapan = user?.locale === "Asia/Tokyo";
  const isYucho = isJapan && bankDetails?.japanBankType === "yucho";

  return (
    <GlassSection
      title={t("bankDetails")}
      headerAction={
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          {tCommon("edit")}
        </Button>
      }
    >
      <div className="grid gap-x-8 md:grid-cols-2">
        <InfoRow label={tCommon("bankName")} value={bankDetails?.bankName} />
        <InfoRow
          label={tCommon("bankAccountName")}
          value={bankDetails?.bankAccountName}
        />
        {isJapan ? (
          isYucho ? (
            <>
              {/* ゆうちょ銀行 fields */}
              <InfoRow
                label={tCommon("bankSymbol")}
                value={bankDetails?.bankSymbol}
              />
              <InfoRow
                label={tCommon("bankNumber")}
                value={bankDetails?.bankNumber}
              />
            </>
          ) : (
            <>
              {/* Ngân hàng Nhật thông thường */}
              <InfoRow
                label={tCommon("bankCode")}
                value={bankDetails?.bankCode}
              />
              <InfoRow
                label={tCommon("bankBranchCode")}
                value={bankDetails?.bankBranchCode}
              />
              <InfoRow
                label={tCommon("bankBranchName")}
                value={bankDetails?.bankBranchName}
              />
              <InfoRow
                label={tCommon("bankAccount")}
                value={bankDetails?.bankAccount}
              />
            </>
          )
        ) : (
          <>
            {/* Ngân hàng Việt Nam - chỉ có số tài khoản */}
            <InfoRow
              label={tCommon("bankAccount")}
              value={bankDetails?.bankAccount}
            />
          </>
        )}
      </div>
    </GlassSection>
  );
}

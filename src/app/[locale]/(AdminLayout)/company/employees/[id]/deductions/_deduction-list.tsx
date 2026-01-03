"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Edit, Power, Badge as BadgeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeDeduction } from "@/types/attendance-records";
import { deactivateDeduction } from "@/lib/apis/employee-deduction-api";
import { formatDate } from "@/lib/utils/format-date";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { ConfirmationDialog } from "@/app/[locale]/_components/_base/confirmation-dialog";

interface DeductionListProps {
  deductions: EmployeeDeduction[];
  onEdit: (deduction: EmployeeDeduction) => void;
  onDeactivateSuccess: () => void;
}

export function DeductionList({
  deductions,
  onEdit,
  onDeactivateSuccess,
}: DeductionListProps) {
  const t = useTranslations("deductions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tDialogs = useTranslations("dialogs");
  const locale = useLocale() as SupportedLocale;

  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!deactivatingId) return;

    setIsDeactivating(true);
    try {
      await deactivateDeduction(deactivatingId);
      toast.success(t("deactivateSuccess"));
      onDeactivateSuccess();
    } catch (error) {
      console.error("Error deactivating deduction:", error);
      toast.error(t("deactivateError"));
    } finally {
      setIsDeactivating(false);
      setDeactivatingId(null);
    }
  };

  // Format giá trị: số tiền hoặc phần trăm
  const formatValue = (deduction: EmployeeDeduction) => {
    if (deduction.deductionType === "PERCENTAGE" && deduction.percentage) {
      return `${deduction.percentage}%`;
    }
    return formatCurrency(deduction.amount || 0, "ja");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>{t("deductionType")}</TableHead>
            <TableHead>{tCommon("name")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead>{t("effectiveFrom")}</TableHead>
            <TableHead>{t("effectiveTo")}</TableHead>
            <TableHead>{tCommon("status")}</TableHead>
            <TableHead className="text-right">{tCommon("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deductions.map((deduction, index) => (
            <TableRow key={deduction.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {getEnumLabel("deductionType", deduction.deductionType, tEnums)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{deduction.deductionName}</span>
                  {deduction.isOverride ? (
                    <Badge variant="secondary" className="text-xs">
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      {t("individualOverride")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {t("companyDefault")}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-destructive">
                -{formatValue(deduction)}
              </TableCell>
              <TableCell>
                {formatDate(deduction.effectiveFrom, locale)}
              </TableCell>
              <TableCell>
                {deduction.effectiveTo
                  ? formatDate(deduction.effectiveTo, locale)
                  : "-"}
              </TableCell>
              <TableCell>
                {deduction.isActive ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {tCommon("active")}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{tCommon("inactive")}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(deduction)}
                    disabled={!deduction.isActive}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {deduction.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeactivatingId(deduction.id)}
                    >
                      <Power className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog for Deactivation */}
      <ConfirmationDialog
        open={deactivatingId !== null}
        onOpenChange={(open) => !open && setDeactivatingId(null)}
        title={tDialogs("deactivateDeductionTitle")}
        description={tDialogs("deactivateDeductionDesc")}
        confirmText={tCommon("confirm")}
        cancelText={tCommon("cancel")}
        variant="warning"
        onConfirm={handleDeactivate}
        isLoading={isDeactivating}
      />
    </>
  );
}

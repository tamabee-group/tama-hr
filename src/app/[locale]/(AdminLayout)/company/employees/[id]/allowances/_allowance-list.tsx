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
import { EmployeeAllowance } from "@/types/attendance-records";
import { deactivateAllowance } from "@/lib/apis/employee-allowance-api";
import { formatDate } from "@/lib/utils/format-date";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { ConfirmationDialog } from "@/app/[locale]/_components/_base/confirmation-dialog";

interface AllowanceListProps {
  allowances: EmployeeAllowance[];
  onEdit: (allowance: EmployeeAllowance) => void;
  onDeactivateSuccess: () => void;
}

export function AllowanceList({
  allowances,
  onEdit,
  onDeactivateSuccess,
}: AllowanceListProps) {
  const t = useTranslations("allowances");
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
      await deactivateAllowance(deactivatingId);
      toast.success(t("deactivateSuccess"));
      onDeactivateSuccess();
    } catch (error) {
      console.error("Error deactivating allowance:", error);
      toast.error(t("deactivateError"));
    } finally {
      setIsDeactivating(false);
      setDeactivatingId(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>{t("allowanceType")}</TableHead>
            <TableHead>{tCommon("name")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead>{t("taxable")}</TableHead>
            <TableHead>{t("effectiveFrom")}</TableHead>
            <TableHead>{t("effectiveTo")}</TableHead>
            <TableHead>{tCommon("status")}</TableHead>
            <TableHead className="text-right">{tCommon("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allowances.map((allowance, index) => (
            <TableRow key={allowance.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {getEnumLabel("allowanceType", allowance.allowanceType, tEnums)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{allowance.allowanceName}</span>
                  {allowance.isOverride ? (
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
              <TableCell className="text-right font-medium">
                {formatCurrency(allowance.amount, "ja")}
              </TableCell>
              <TableCell>
                {allowance.taxable ? (
                  <Badge variant="destructive">{tCommon("yes")}</Badge>
                ) : (
                  <Badge variant="secondary">{tCommon("no")}</Badge>
                )}
              </TableCell>
              <TableCell>
                {formatDate(allowance.effectiveFrom, locale)}
              </TableCell>
              <TableCell>
                {allowance.effectiveTo
                  ? formatDate(allowance.effectiveTo, locale)
                  : "-"}
              </TableCell>
              <TableCell>
                {allowance.isActive ? (
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
                    onClick={() => onEdit(allowance)}
                    disabled={!allowance.isActive}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {allowance.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeactivatingId(allowance.id)}
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
        title={tDialogs("deactivateAllowanceTitle")}
        description={tDialogs("deactivateAllowanceDesc")}
        confirmText={tCommon("confirm")}
        cancelText={tCommon("cancel")}
        variant="warning"
        onConfirm={handleDeactivate}
        isLoading={isDeactivating}
      />
    </>
  );
}

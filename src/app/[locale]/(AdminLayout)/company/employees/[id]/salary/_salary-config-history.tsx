"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Edit, Calendar, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { deleteSalaryConfig } from "@/lib/apis/salary-config-api";

interface SalaryConfigHistoryProps {
  employeeId: number;
  history: EmployeeSalaryConfig[];
  currentConfigId?: number;
  onEdit: (config: EmployeeSalaryConfig) => void;
  onDeleted: () => void;
}

export function SalaryConfigHistory({
  employeeId,
  history,
  currentConfigId,
  onEdit,
  onDeleted,
}: SalaryConfigHistoryProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [deleteConfig, setDeleteConfig] = useState<EmployeeSalaryConfig | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfig) return;
    setIsDeleting(true);
    try {
      await deleteSalaryConfig(employeeId, deleteConfig.id);
      toast.success(t("deleteSuccess"));
      onDeleted();
    } catch (error) {
      console.error("Error deleting salary config:", error);
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
      setDeleteConfig(null);
    }
  };

  // Lấy label cho salary type
  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case "MONTHLY":
        return t("typeMonthly");
      case "DAILY":
        return t("typeDaily");
      case "HOURLY":
        return t("typeHourly");
      case "SHIFT_BASED":
        return t("typeShiftBased");
      default:
        return type;
    }
  };

  // Lấy số tiền dựa trên loại lương
  const getSalaryAmount = (config: EmployeeSalaryConfig) => {
    switch (config.salaryType) {
      case "MONTHLY":
        return config.monthlySalary;
      case "DAILY":
        return config.dailyRate;
      case "HOURLY":
        return config.hourlyRate;
      case "SHIFT_BASED":
        return config.shiftRate;
      default:
        return 0;
    }
  };

  // Xác định trạng thái của config
  const getConfigStatus = (config: EmployeeSalaryConfig) => {
    const today = new Date().toISOString().split("T")[0];
    const effectiveFrom = config.effectiveFrom;
    const effectiveTo = config.effectiveTo;

    // Nếu là config hiện tại
    if (config.id === currentConfigId) {
      return { label: t("statusActive"), variant: "default" as const };
    }

    // Nếu chưa đến ngày hiệu lực
    if (effectiveFrom > today) {
      return { label: t("statusUpcoming"), variant: "secondary" as const };
    }

    // Nếu đã hết hiệu lực
    if (effectiveTo && effectiveTo < today) {
      return { label: t("statusExpired"), variant: "outline" as const };
    }

    return { label: t("statusActive"), variant: "default" as const };
  };

  if (history.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">{t("noHistory")}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>{t("table.salaryType")}</TableHead>
            <TableHead>{t("table.amount")}</TableHead>
            <TableHead>{t("table.effectiveFrom")}</TableHead>
            <TableHead>{t("table.effectiveTo")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-[80px]">{tCommon("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((config, index) => {
            const status = getConfigStatus(config);
            const amount = getSalaryAmount(config);
            const isCurrent = config.id === currentConfigId;

            return (
              <TableRow
                key={config.id}
                className={isCurrent ? "bg-green-50 dark:bg-green-950/20" : ""}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{getSalaryTypeLabel(config.salaryType)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(amount || 0, locale)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(config.effectiveFrom, locale)}
                  </div>
                </TableCell>
                <TableCell>
                  {config.effectiveTo ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(config.effectiveTo, locale)}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={status.variant}
                    className={
                      isCurrent ? "bg-green-600 hover:bg-green-600" : ""
                    }
                  >
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(config)}
                      title={t("edit")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfig(config)}
                      title={tCommon("delete")}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteConfig}
        onOpenChange={() => setDeleteConfig(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

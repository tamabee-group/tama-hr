"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Edit,
  XCircle,
  Trash2,
  User,
  Calendar,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { EmploymentContract } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { contractApi } from "@/lib/apis/contract-api";
import { ContractFormDialog } from "./_contract-form-dialog";
import { TerminateContractDialog } from "./_terminate-contract-dialog";

interface ContractDetailDialogProps {
  open: boolean;
  onClose: () => void;
  contract: EmploymentContract | null;
  onSuccess: () => void;
}

// Tính toán progress bar (% thời gian còn lại - giảm dần)
function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  // Nếu chưa bắt đầu, trả về 100% (còn toàn bộ thời gian)
  if (now < start) return 100;
  // Nếu đã kết thúc, trả về 0% (hết thời gian)
  if (now > end) return 0;

  // Tính % thời gian còn lại (giảm dần từ 100% về 0%)
  const total = end - start;
  const remaining = end - now;
  return Math.round((remaining / total) * 100);
}

export function ContractDetailDialog({
  open,
  onClose,
  contract,
  onSuccess,
}: ContractDetailDialogProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!contract) return null;

  const isActive = contract.status === "ACTIVE";
  const progress = isActive
    ? calculateProgress(contract.startDate, contract.endDate)
    : 0;
  const isExpiringSoon =
    isActive &&
    contract.daysUntilExpiry !== undefined &&
    contract.daysUntilExpiry <= 30;

  const handleEdit = () => setShowEditDialog(true);
  const handleTerminate = () => setShowTerminateDialog(true);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await contractApi.deleteContract(contract.id);
      toast.success(t("deleteSuccess"));
      setShowDeleteDialog(false);
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionSuccess = () => {
    setShowEditDialog(false);
    setShowTerminateDialog(false);
    onSuccess();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[950px] p-0 gap-0 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
          <DialogTitle className="sr-only">
            {t("detailTitle")} - {contract.contractNumber}
          </DialogTitle>
          {/* Content - 2 columns layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            {/* Left Column - Contract Card */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              {/* Mobile: compact layout */}
              <div className="flex flex-col gap-4 lg:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("contractNumber")}
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                      {contract.contractNumber}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={`shrink-0 text-sm px-3 py-1 ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {getEnumLabel("contractStatus", contract.status, tEnums)}
                </Badge>
              </div>

              {/* Mobile: progress bar compact */}
              {isActive && contract.daysUntilExpiry !== undefined && (
                <div className="lg:hidden space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t("daysUntilExpiry")}:{" "}
                      <span
                        className={`font-bold text-base ${isExpiringSoon ? "text-orange-500" : "text-slate-900 dark:text-slate-100"}`}
                      >
                        {contract.daysUntilExpiry}
                      </span>{" "}
                      {t("days")}
                    </span>
                    {isExpiringSoon && (
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-500 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {t("expiringSoon")}
                      </span>
                    )}
                  </div>
                  <Progress
                    value={progress}
                    className={`h-2 ${isExpiringSoon ? "[&>div]:bg-orange-500" : "[&>div]:bg-emerald-500"}`}
                  />
                </div>
              )}

              {/* Desktop: centered layout */}
              <div className="hidden lg:block space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Contract Number */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("contractNumber")}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {contract.contractNumber}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`text-sm px-4 py-1.5 ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {getEnumLabel("contractStatus", contract.status, tEnums)}
                  </Badge>
                </div>

                {/* Days Remaining & Progress */}
                {isActive && contract.daysUntilExpiry !== undefined && (
                  <div className="space-y-4 pt-4">
                    <div className="text-center space-y-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("daysUntilExpiry")}
                      </p>
                      <p
                        className={`text-6xl font-bold ${isExpiringSoon ? "text-orange-500" : "text-slate-900 dark:text-slate-100"}`}
                      >
                        {contract.daysUntilExpiry}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t("days")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          {progress}%
                        </span>
                        {isExpiringSoon && (
                          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-500 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {t("expiringSoon")}
                          </span>
                        )}
                      </div>
                      <Progress
                        value={progress}
                        className={`h-2 ${isExpiringSoon ? "[&>div]:bg-orange-500" : "[&>div]:bg-emerald-500"}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
              {/* Title - ẩn trên mobile vì đã hiện ở left column */}
              <h2 className="hidden lg:block text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t("detailTitle")}
              </h2>

              {/* Employee */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("table.employee")}
                </p>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {contract.employeeName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {contract.employeeCode && `${contract.employeeCode}`}
                      {contract.employeeCode && contract.employeeEmail && " · "}
                      {contract.employeeEmail && contract.employeeEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Period */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("table.period")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t("startDate")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(contract.startDate, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Calendar className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t("endDate")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(contract.endDate, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Type */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("contractType")}
                </p>
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {getEnumLabel(
                      "contractType",
                      contract.contractType,
                      tEnums,
                    )}
                  </p>
                </div>
              </div>

              {/* Termination Info */}
              {contract.status === "TERMINATED" && (
                <div className="space-y-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {t("terminateTitle")}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {contract.terminatedAt && (
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminatedAt")}
                        </span>
                        <span className="font-medium text-red-900 dark:text-red-100">
                          {formatDate(contract.terminatedAt, locale)}
                        </span>
                      </div>
                    )}
                    {contract.terminatorName && (
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminatedBy")}
                        </span>
                        <span className="font-medium text-red-900 dark:text-red-100">
                          {contract.terminatorName}
                        </span>
                      </div>
                    )}
                    {contract.terminationReason && (
                      <div className="pt-1">
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminateReason")}:
                        </span>
                        <p className="mt-0.5 text-red-800 dark:text-red-200">
                          {contract.terminationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contract.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t("notes")}
                  </p>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {contract.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                {isActive && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                      {tCommon("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTerminate}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800 flex-1 sm:flex-none"
                    >
                      <XCircle className="h-4 w-4" />
                      {t("terminate")}
                    </Button>
                  </>
                )}
                {!isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    {tCommon("delete")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <ContractFormDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={handleActionSuccess}
        existingContract={contract}
      />

      {/* Terminate Dialog */}
      <TerminateContractDialog
        open={showTerminateDialog}
        onClose={() => setShowTerminateDialog(false)}
        contract={contract}
        onSuccess={handleActionSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmMessage")}
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
    </>
  );
}

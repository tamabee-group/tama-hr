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
import { formatDate } from "@/lib/utils/format-date";
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
        <DialogContent className="sm:max-w-[950px] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
          <DialogTitle className="sr-only">
            {t("detailTitle")} - {contract.contractNumber}
          </DialogTitle>
          {/* Content - 2 columns layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            {/* Left Column - Contract Card */}
            <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
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

              {/* Download PDF Button */}
              {/* <Button
                variant="outline"
                className="w-full gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                {t("downloadPdf")}
              </Button> */}
            </div>

            {/* Right Column - Details */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Title */}
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center lg:text-left">
                {t("detailTitle")}
              </h2>

              {/* Employee */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("table.employee")}
                </p>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {contract.employeeName}
                    </p>
                    {contract.employeeCode && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ID: {contract.employeeCode}
                      </p>
                    )}
                    {contract.employeeEmail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {contract.employeeEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Period */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("table.period")}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {t("startDate")}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(contract.startDate, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Calendar className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {t("endDate")}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(contract.endDate, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Type */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("contractType")}
                </p>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">
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
                <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {t("terminateTitle")}
                  </p>
                  <div className="space-y-2 text-sm">
                    {contract.terminatedAt && (
                      <div>
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminatedAt")}:{" "}
                        </span>
                        <span className="font-medium text-red-900 dark:text-red-100">
                          {formatDate(contract.terminatedAt, locale)}
                        </span>
                      </div>
                    )}
                    {contract.terminatorName && (
                      <div>
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminatedBy")}:{" "}
                        </span>
                        <span className="font-medium text-red-900 dark:text-red-100">
                          {contract.terminatorName}
                        </span>
                      </div>
                    )}
                    {contract.terminationReason && (
                      <div>
                        <span className="text-red-700 dark:text-red-300">
                          {t("terminateReason")}:{" "}
                        </span>
                        <span className="text-red-800 dark:text-red-200">
                          {contract.terminationReason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contract.notes && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("notes")}
                  </p>
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm leading-relaxed italic text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      &ldquo;{contract.notes}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                <Button
                  onClick={onClose}
                  className="bg-cyan-600 hover:bg-cyan-700 ml-auto"
                  size="sm"
                >
                  {tCommon("close")}
                </Button>
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

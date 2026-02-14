"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { SalaryItemTemplate, SalaryItemType } from "@/types/salary-item";
import { salaryItemTemplateApi } from "@/lib/apis/salary-item-template-api";

interface SalaryItemTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: SalaryItemTemplate | null;
  type: SalaryItemType;
  onSave: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
  isSaving: boolean;
}

export function SalaryItemTemplateDialog({
  open,
  onOpenChange,
  template,
  type,
  onSave,
  onDelete,
  isSaving,
}: SalaryItemTemplateDialogProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  useEffect(() => {
    if (open) {
      setName(template?.name || "");
      setError("");
      setEmployeeCount(0);
    }
  }, [template, open]);

  // Kiểm tra dữ liệu có thay đổi không
  const hasChanges = template
    ? name.trim() !== template.name
    : name.trim() !== "";

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("allowanceDeduction.nameRequired"));
      return;
    }

    await onSave(name.trim());
  };

  // Khi click nút xóa, lấy số nhân viên đang sử dụng template
  const handleDeleteClick = async () => {
    if (!template) return;

    setIsLoadingCount(true);
    try {
      const count = await salaryItemTemplateApi.getEmployeeCountByTemplateId(
        template.id,
      );
      setEmployeeCount(count);
    } catch {
      setEmployeeCount(0);
    } finally {
      setIsLoadingCount(false);
      setShowDeleteDialog(true);
    }
  };

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteDialog(false);
  };

  const isNew = !template;
  const isAllowance = type === SalaryItemType.ALLOWANCE;

  // Tạo description cho dialog xóa
  const getDeleteDescription = () => {
    if (employeeCount > 0) {
      return isAllowance
        ? t("allowanceDeduction.deleteAllowanceWithEmployees", {
            count: employeeCount,
          })
        : t("allowanceDeduction.deleteDeductionWithEmployees", {
            count: employeeCount,
          });
    }
    return isAllowance
      ? t("allowanceDeduction.deleteAllowanceDesc")
      : t("allowanceDeduction.deleteDeductionDesc");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isNew
                ? isAllowance
                  ? t("allowanceDeduction.addAllowance")
                  : t("allowanceDeduction.addDeduction")
                : isAllowance
                  ? t("allowanceDeduction.editAllowance")
                  : t("allowanceDeduction.editDeduction")}
            </DialogTitle>
            <VisuallyHidden>
              <DialogDescription>
                {isAllowance
                  ? t("allowanceDeduction.allowance")
                  : t("allowanceDeduction.deduction")}
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder={t("allowanceDeduction.namePlaceholder")}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter className="flex-row justify-between">
            <div>
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={isSaving || isLoadingCount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tCommon("delete")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || (!isNew && !hasChanges)}
              >
                {isNew ? tCommon("create") : tCommon("update")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAllowance
                ? t("allowanceDeduction.deleteAllowanceTitle")
                : t("allowanceDeduction.deleteDeductionTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>{getDeleteDescription()}</span>
              {employeeCount > 0 && (
                <span className="block text-destructive font-medium">
                  {t("allowanceDeduction.deleteWarning")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

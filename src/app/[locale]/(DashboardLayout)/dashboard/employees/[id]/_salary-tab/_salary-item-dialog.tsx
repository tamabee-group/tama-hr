"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmployeeSalaryItem,
  SalaryItemTemplate,
  SalaryItemType,
  AssignSalaryItemRequest,
  UpdateSalaryItemRequest,
} from "@/types/salary-item";
import { employeeSalaryItemApi } from "@/lib/apis/employee-salary-item-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface SalaryItemDialogProps {
  employeeId: number;
  type: SalaryItemType;
  templates: SalaryItemTemplate[];
  existingItem: EmployeeSalaryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SalaryItemDialog({
  employeeId,
  type,
  templates,
  existingItem,
  open,
  onOpenChange,
  onSuccess,
}: SalaryItemDialogProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [formData, setFormData] = useState<AssignSalaryItemRequest>({
    templateId: 0,
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi dialog mở/đóng hoặc existingItem thay đổi
  useEffect(() => {
    if (existingItem) {
      setFormData({
        templateId: existingItem.templateId,
        amount: existingItem.amount,
      });
    } else {
      setFormData({
        templateId: 0,
        amount: 0,
      });
    }
    setErrors({});
  }, [existingItem, open]);

  // Kiểm tra dữ liệu có thay đổi không
  const hasChanges = existingItem
    ? formData.templateId !== existingItem.templateId ||
      formData.amount !== existingItem.amount
    : formData.templateId !== 0 && formData.amount > 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.templateId || formData.templateId === 0) {
      newErrors.templateId = t("templateRequired");
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = t("amountRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (existingItem) {
        const updateData: UpdateSalaryItemRequest = {
          templateId: formData.templateId,
          amount: formData.amount,
        };
        await employeeSalaryItemApi.updateSalaryItem(
          employeeId,
          existingItem.id,
          updateData,
        );
        toast.success(
          type === SalaryItemType.ALLOWANCE
            ? t("allowanceUpdateSuccess")
            : t("deductionUpdateSuccess"),
        );
      } else {
        await employeeSalaryItemApi.assignSalaryItem(employeeId, formData);
        toast.success(
          type === SalaryItemType.ALLOWANCE
            ? t("allowanceCreateSuccess")
            : t("deductionCreateSuccess"),
        );
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving salary item:", error);
      const errorMessage = getErrorMessage(error, tErrors);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingItem) return;

    setIsSubmitting(true);
    try {
      await employeeSalaryItemApi.deleteSalaryItem(employeeId, existingItem.id);
      toast.success(
        type === SalaryItemType.ALLOWANCE
          ? t("allowanceDeleteSuccess")
          : t("deductionDeleteSuccess"),
      );
      onSuccess();
    } catch (error) {
      console.error("Error deleting salary item:", error);
      const errorMessage = getErrorMessage(error, tErrors);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = existingItem
    ? type === SalaryItemType.ALLOWANCE
      ? t("editAllowance")
      : t("editDeduction")
    : type === SalaryItemType.ALLOWANCE
      ? t("createAllowance")
      : t("createDeduction");

  // Hiển thị message khi không có templates
  const renderNoTemplatesMessage = () => (
    <div className="text-center py-4 space-y-2">
      <p className="text-muted-foreground">
        {type === SalaryItemType.ALLOWANCE
          ? t("noAllowanceTemplates")
          : t("noDeductionTemplates")}
      </p>
      <Link
        href="/dashboard/settings"
        className="text-primary underline hover:no-underline text-sm"
      >
        {t("goToSettings")}
      </Link>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {templates.length === 0 ? (
          renderNoTemplatesMessage()
        ) : (
          <div className="space-y-4 mt-6 mb-4">
            <div className="space-y-2">
              <Label htmlFor="template">
                {type === SalaryItemType.ALLOWANCE
                  ? t("allowanceName")
                  : t("deductionName")}
              </Label>
              <Select
                value={formData.templateId ? String(formData.templateId) : ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, templateId: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectTemplatePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.templateId && (
                <p className="text-sm text-red-500">{errors.templateId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")}</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                placeholder="0"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-between">
          {existingItem && templates.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {tCommon("delete")}
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            {templates.length > 0 && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!!existingItem && !hasChanges)}
              >
                {isSubmitting
                  ? tCommon("processing")
                  : existingItem
                    ? tCommon("update")
                    : tCommon("create")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SalaryItemTemplate, SalaryItemType } from "@/types/salary-item";
import { salaryItemTemplateApi } from "@/lib/apis/salary-item-template-api";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { ColumnDef } from "@tanstack/react-table";
import { SalaryItemTemplateDialog } from "./_salary-item-template-dialog";
import { HelpLink } from "@/components/ui/help-link";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface SalaryItemTemplateConfigProps {
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

export function SalaryItemTemplateConfig({
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: SalaryItemTemplateConfigProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [allowanceTemplates, setAllowanceTemplates] = useState<
    SalaryItemTemplate[]
  >([]);
  const [deductionTemplates, setDeductionTemplates] = useState<
    SalaryItemTemplate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<SalaryItemTemplate | null>(null);
  const [dialogType, setDialogType] = useState<SalaryItemType>(
    SalaryItemType.ALLOWANCE,
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allowances, deductions] = await Promise.all([
        salaryItemTemplateApi.getTemplatesByType(SalaryItemType.ALLOWANCE),
        salaryItemTemplateApi.getTemplatesByType(SalaryItemType.DEDUCTION),
      ]);
      setAllowanceTemplates(allowances);
      setDeductionTemplates(deductions);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error(tCommon("loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [tCommon]);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Không cần kiểm tra hasChanges vì lưu ngay
  useEffect(() => {
    onChangesUpdate(false);
  }, [onChangesUpdate]);

  // Không cần save handler
  useEffect(() => {
    setSaveHandler(async () => {});
  }, [setSaveHandler]);

  // Columns cho BaseTable
  const columns: ColumnDef<SalaryItemTemplate>[] = [
    {
      accessorKey: "name",
      header: t("allowanceDeduction.name"),
      cell: ({ row }) => `${row.index + 1}. ${row.original.name}`,
    },
  ];

  const handleRowClick = (template: SalaryItemTemplate) => {
    setEditingTemplate(template);
    setDialogType(template.type);
    setDialogOpen(true);
  };

  const handleAddAllowance = () => {
    setEditingTemplate(null);
    setDialogType(SalaryItemType.ALLOWANCE);
    setDialogOpen(true);
  };

  const handleAddDeduction = () => {
    setEditingTemplate(null);
    setDialogType(SalaryItemType.DEDUCTION);
    setDialogOpen(true);
  };

  const handleSave = async (name: string) => {
    setIsSaving(true);
    try {
      if (editingTemplate) {
        // Cập nhật
        await salaryItemTemplateApi.updateTemplate(editingTemplate.id, {
          name,
        });
      } else {
        // Tạo mới
        await salaryItemTemplateApi.createTemplate({
          name,
          type: dialogType,
        });
      }

      toast.success(tCommon("saveSuccess"));
      setDialogOpen(false);
      await loadTemplates();
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(tCommon("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTemplate) return;

    setIsSaving(true);
    try {
      await salaryItemTemplateApi.deleteTemplate(editingTemplate.id);
      toast.success(tCommon("saveSuccess"));
      setDialogOpen(false);
      await loadTemplates();
      onSaveSuccess();
    } catch (error: unknown) {
      console.error("Failed to delete:", error);
      const errorCode =
        (error as { errorCode?: string })?.errorCode || "UNKNOWN_ERROR";
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phụ cấp */}
        <GlassSection>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t("allowanceDeduction.allowance")}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAllowance}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              {tCommon("add")}
            </Button>
          </div>
          {allowanceTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("allowanceDeduction.noTemplates")}
            </p>
          ) : (
            <BaseTable
              data={allowanceTemplates}
              columns={columns}
              onRowClick={handleRowClick}
              showPagination={false}
            />
          )}
        </GlassSection>

        {/* Khấu trừ */}
        <GlassSection>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t("allowanceDeduction.deduction")}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDeduction}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              {tCommon("add")}
            </Button>
          </div>
          {deductionTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("allowanceDeduction.noTemplates")}
            </p>
          ) : (
            <BaseTable
              data={deductionTemplates}
              columns={columns}
              onRowClick={handleRowClick}
              showPagination={false}
            />
          )}
        </GlassSection>
      </div>

      <SalaryItemTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        type={dialogType}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
      />

      <HelpLink
        topic="company_settings"
        article="allowance_deduction_settings"
      />
    </>
  );
}

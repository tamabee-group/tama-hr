"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { getEmployeeSalaryConfigHistory } from "@/lib/apis/salary-config-api";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { SalaryConfigFormDialog } from "./_salary-config-form-dialog";
import { SalaryConfigHistory } from "./_salary-config-history";
import { EmployeePayrollContent } from "../payroll/_employee-payroll-content";
import { SalaryItemList } from "./_salary-item-list";
import { SalaryItemDialog } from "./_salary-item-dialog";
import {
  EmployeeSalaryItem,
  SalaryItemTemplate,
  SalaryItemType,
} from "@/types/salary-item";
import { employeeSalaryItemApi } from "@/lib/apis/employee-salary-item-api";
import { salaryItemTemplateApi } from "@/lib/apis/salary-item-template-api";
import { ExplanationPanel } from "../../../../../_components/_explanation-panel";

interface SalaryConfigContentProps {
  employeeId: number;
}

export function SalaryContent({ employeeId }: SalaryConfigContentProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");

  const [history, setHistory] = useState<EmployeeSalaryConfig[]>([]);
  const [allowances, setAllowances] = useState<EmployeeSalaryItem[]>([]);
  const [deductions, setDeductions] = useState<EmployeeSalaryItem[]>([]);
  const [allowanceTemplates, setAllowanceTemplates] = useState<
    SalaryItemTemplate[]
  >([]);
  const [deductionTemplates, setDeductionTemplates] = useState<
    SalaryItemTemplate[]
  >([]);
  const [cutoffDay, setCutoffDay] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showSalaryFormDialog, setShowSalaryFormDialog] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<EmployeeSalaryConfig | null>(null);
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [editingAllowance, setEditingAllowance] =
    useState<EmployeeSalaryItem | null>(null);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  const [editingDeduction, setEditingDeduction] =
    useState<EmployeeSalaryItem | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        historyData,
        settings,
        allowancesData,
        deductionsData,
        allTemplates,
      ] = await Promise.all([
        getEmployeeSalaryConfigHistory(employeeId),
        companySettingsApi.getSettings(),
        employeeSalaryItemApi.getEmployeeAllowances(employeeId),
        employeeSalaryItemApi.getEmployeeDeductions(employeeId),
        salaryItemTemplateApi.getAllTemplates(),
      ]);
      setHistory(historyData || []);
      setCutoffDay(settings?.payrollConfig?.cutoffDay || 0);
      setAllowances(allowancesData || []);
      setDeductions(deductionsData || []);
      // Filter templates theo type
      setAllowanceTemplates(
        allTemplates?.filter((t) => t.type === SalaryItemType.ALLOWANCE) || [],
      );
      setDeductionTemplates(
        allTemplates?.filter((t) => t.type === SalaryItemType.DEDUCTION) || [],
      );
    } catch (error) {
      console.error("Error fetching salary config:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, tCommon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý khi tạo/cập nhật thành công
  const handleSalarySuccess = () => {
    setShowSalaryFormDialog(false);
    setEditingConfig(null);
    fetchData();
  };

  const handleAllowanceSuccess = () => {
    setShowAllowanceDialog(false);
    setEditingAllowance(null);
    fetchData();
  };

  const handleDeductionSuccess = () => {
    setShowDeductionDialog(false);
    setEditingDeduction(null);
    fetchData();
  };

  // Xử lý khi click edit
  const handleEditSalary = (config: EmployeeSalaryConfig) => {
    setEditingConfig(config);
    setShowSalaryFormDialog(true);
  };

  const handleEditAllowance = (item: EmployeeSalaryItem) => {
    setEditingAllowance(item);
    setShowAllowanceDialog(true);
  };

  const handleEditDeduction = (item: EmployeeSalaryItem) => {
    setEditingDeduction(item);
    setShowDeductionDialog(true);
  };

  // Xử lý khi click tạo mới
  const handleCreateSalary = () => {
    setEditingConfig(null);
    setShowSalaryFormDialog(true);
  };

  const handleCreateAllowance = () => {
    setEditingAllowance(null);
    setShowAllowanceDialog(true);
  };

  const handleCreateDeduction = () => {
    setEditingDeduction(null);
    setShowDeductionDialog(true);
  };

  // Tạo hint rule3 động theo cutoffDay
  const getPayrollPeriodHint = () => {
    if (cutoffDay === 0 || cutoffDay >= 28) {
      return t("hint.rule3EndOfMonth");
    }
    const startDay = cutoffDay + 1;
    return t("hint.rule3Custom", { startDay, endDay: cutoffDay });
  };

  // Tạo description và tips cho ExplanationPanel
  const getExplanationDescription = () => {
    return t("hint.description");
  };

  const getExplanationTips = () => {
    const tips = [
      t("hint.rule1"),
      t("hint.rule2"),
      getPayrollPeriodHint(),
      t("hint.allowanceRule"),
      t("hint.deductionRule"),
    ];
    return tips;
  };

  if (isLoading) {
    return <SalaryConfigSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Hint box - ExplanationPanel */}
      <ExplanationPanel
        title={t("hint.title")}
        description={getExplanationDescription()}
        tips={getExplanationTips()}
        defaultCollapsed
      />

      {/* Payslip History */}
      <div className="space-y-2">
        <EmployeePayrollContent employeeId={employeeId} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:gap-4">
        {/* Allowances Section */}
        <div className="border rounded-md shadow-sm">
          <div className="flex items-center justify-between font-bold py-2 lg:pt-4 px-4 border-b">
            <span>{t("allowancesTitle")}</span>
            <Button onClick={handleCreateAllowance} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("createAllowance")}
            </Button>
          </div>
          <div className="p-4">
            <SalaryItemList
              type={SalaryItemType.ALLOWANCE}
              items={allowances}
              onRowClick={handleEditAllowance}
            />
          </div>
        </div>

        {/* Deductions Section */}
        <div className="border rounded-md shadow-sm">
          <div className="flex items-center justify-between font-bold py-2 lg:pt-4 px-4 border-b">
            <span>{t("deductionsTitle")}</span>
            <Button onClick={handleCreateDeduction} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("createDeduction")}
            </Button>
          </div>
          <div className="p-4">
            <SalaryItemList
              type={SalaryItemType.DEDUCTION}
              items={deductions}
              onRowClick={handleEditDeduction}
            />
          </div>
        </div>
      </div>

      {/* Salary History */}
      <div className="border rounded-md shadow-sm">
        <div className="flex items-center justify-between font-bold py-2 lg:pt-4 px-4 border-b">
          <span>{t("historyTitle")}</span>
          <Button onClick={handleCreateSalary} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("create")}
          </Button>
        </div>
        <div className="p-4">
          <SalaryConfigHistory
            employeeId={employeeId}
            history={history}
            onEdit={handleEditSalary}
            onDeleted={fetchData}
          />
        </div>
      </div>

      {/* Form Dialogs */}
      <SalaryConfigFormDialog
        employeeId={employeeId}
        existingConfig={editingConfig}
        allConfigs={history}
        cutoffDay={cutoffDay}
        open={showSalaryFormDialog}
        onOpenChange={(open) => {
          setShowSalaryFormDialog(open);
          if (!open) setEditingConfig(null);
        }}
        onSuccess={handleSalarySuccess}
      />

      <SalaryItemDialog
        employeeId={employeeId}
        type={SalaryItemType.ALLOWANCE}
        templates={allowanceTemplates}
        existingItem={editingAllowance}
        open={showAllowanceDialog}
        onOpenChange={(open) => {
          setShowAllowanceDialog(open);
          if (!open) setEditingAllowance(null);
        }}
        onSuccess={handleAllowanceSuccess}
      />

      <SalaryItemDialog
        employeeId={employeeId}
        type={SalaryItemType.DEDUCTION}
        templates={deductionTemplates}
        existingItem={editingDeduction}
        open={showDeductionDialog}
        onOpenChange={(open) => {
          setShowDeductionDialog(open);
          if (!open) setEditingDeduction(null);
        }}
        onSuccess={handleDeductionSuccess}
      />
    </div>
  );
}

function SalaryConfigSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border rounded-md shadow-sm p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="border rounded-md shadow-sm p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="border rounded-md shadow-sm p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

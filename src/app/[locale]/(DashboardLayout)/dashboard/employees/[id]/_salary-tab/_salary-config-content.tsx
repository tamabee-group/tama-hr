"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Info, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import {
  getEmployeeCurrentSalaryConfig,
  getEmployeeSalaryConfigHistory,
} from "@/lib/apis/salary-config-api";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { SalaryConfigFormDialog } from "./_salary-config-form-dialog";
import { SalaryConfigHistory } from "./_salary-config-history";
import { CurrentSalaryCard } from "./_current-salary-card";

interface SalaryConfigContentProps {
  employeeId: number;
}

export function SalaryConfigContent({ employeeId }: SalaryConfigContentProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");

  const [currentConfig, setCurrentConfig] =
    useState<EmployeeSalaryConfig | null>(null);
  const [history, setHistory] = useState<EmployeeSalaryConfig[]>([]);
  const [cutoffDay, setCutoffDay] = useState<number>(0); // 0 = ngày cuối tháng
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<EmployeeSalaryConfig | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyData, settings] = await Promise.all([
        getEmployeeSalaryConfigHistory(employeeId),
        companySettingsApi.getSettings(),
      ]);
      setHistory(historyData || []);
      setCutoffDay(settings?.payrollConfig?.cutoffDay || 0);

      try {
        const configData = await getEmployeeCurrentSalaryConfig(employeeId);
        setCurrentConfig(configData);
      } catch {
        setCurrentConfig(null);
      }
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
  const handleSuccess = () => {
    setShowFormDialog(false);
    setEditingConfig(null);
    fetchData();
  };

  // Xử lý khi click edit từ detail dialog
  const handleEdit = (config: EmployeeSalaryConfig) => {
    setEditingConfig(config);
    setShowFormDialog(true);
  };

  // Xử lý khi click tạo mới
  const handleCreate = () => {
    setEditingConfig(null);
    setShowFormDialog(true);
  };

  // Tạo hint rule3 động theo cutoffDay
  const getPayrollPeriodHint = () => {
    if (cutoffDay === 0 || cutoffDay >= 28) {
      // Ngày cuối tháng
      return t("hint.rule3EndOfMonth");
    }
    // Ví dụ: cutoffDay = 20 → "Kỳ lương tính từ ngày 21 tháng trước đến ngày 20 tháng này"
    const startDay = cutoffDay + 1;
    return t("hint.rule3Custom", { startDay, endDay: cutoffDay });
  };

  if (isLoading) {
    return <SalaryConfigSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Hint box - Collapsible */}
      <Collapsible>
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t("hint.title")}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>{t("hint.description")}</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                  <li>{t("hint.rule1")}</li>
                  <li>{t("hint.rule2")}</li>
                  <li>
                    {getPayrollPeriodHint()}{" "}
                    <Link
                      href="/dashboard/settings"
                      className="text-blue-700 dark:text-blue-300 underline hover:no-underline"
                    >
                      ({t("hint.companySettings")})
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div className="flex flex-col-reverse lg:flex-row gap-6">
        {/* Left: History Table (flex-1) */}
        <GlassSection title={t("historyTitle")} className="flex-1 min-w-0">
          <div className="-mx-6 -mb-6">
            <SalaryConfigHistory
              employeeId={employeeId}
              history={history}
              onEdit={handleEdit}
              onDeleted={fetchData}
            />
          </div>
        </GlassSection>

        {/* Right: Current Config (fixed width) */}
        <GlassSection className="lg:w-[360px] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("currentConfig")}
            </h3>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("create")}
            </Button>
          </div>
          {currentConfig ? (
            <CurrentSalaryCard config={currentConfig} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noConfig")}
            </p>
          )}
        </GlassSection>
      </div>

      {/* Form Dialog */}
      <SalaryConfigFormDialog
        employeeId={employeeId}
        existingConfig={editingConfig}
        allConfigs={history}
        cutoffDay={cutoffDay}
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setEditingConfig(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

function SalaryConfigSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <GlassSection className="flex-1 min-w-0">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </GlassSection>
      <GlassSection className="lg:w-[360px] shrink-0">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      </GlassSection>
    </div>
  );
}

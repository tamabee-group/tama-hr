"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import {
  getEmployeeCurrentSalaryConfig,
  getEmployeeSalaryConfigHistory,
} from "@/lib/apis/salary-config-api";
import { SalaryConfigForm } from "./_salary-config-form";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<EmployeeSalaryConfig | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configData, historyData] = await Promise.all([
        getEmployeeCurrentSalaryConfig(employeeId),
        getEmployeeSalaryConfigHistory(employeeId),
      ]);
      setCurrentConfig(configData);
      setHistory(historyData || []);
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
    setShowForm(false);
    setEditingConfig(null);
    fetchData();
  };

  // Xử lý khi click edit
  const handleEdit = (config: EmployeeSalaryConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  // Xử lý khi click tạo mới
  const handleCreate = () => {
    setEditingConfig(null);
    setShowForm(true);
  };

  // Xử lý khi hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingConfig(null);
  };

  if (isLoading) {
    return <SalaryConfigSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Current Config Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("currentConfig")}</CardTitle>
          {!showForm && (
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("create")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm ? (
            <SalaryConfigForm
              employeeId={employeeId}
              existingConfig={editingConfig}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : currentConfig ? (
            <CurrentSalaryCard
              config={currentConfig}
              onEdit={() => handleEdit(currentConfig)}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noConfig")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("historyTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SalaryConfigHistory
            employeeId={employeeId}
            history={history}
            currentConfigId={currentConfig?.id}
            onEdit={handleEdit}
            onDeleted={fetchData}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SalaryConfigSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

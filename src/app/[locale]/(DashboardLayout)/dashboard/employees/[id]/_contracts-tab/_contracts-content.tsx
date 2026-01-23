"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmploymentContract } from "@/types/attendance-records";
import { User } from "@/types/user";
import {
  getEmployeeCurrentContract,
  getEmployeeContractHistory,
} from "@/lib/apis/employee-detail-api";
import { ContractFormDialog } from "../../../contracts/_contract-form-dialog";
import { ContractHistory } from "./_contract-history";
import { CurrentContractCard } from "./_current-contract-card";
import { ExplanationPanel } from "../../../_components/_explanation-panel";

interface ContractsContentProps {
  employeeId: number;
  employee: User;
}

export function ContractsContent({
  employeeId,
  employee,
}: ContractsContentProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");

  const [currentContract, setCurrentContract] =
    useState<EmploymentContract | null>(null);
  const [history, setHistory] = useState<EmploymentContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingContract, setEditingContract] =
    useState<EmploymentContract | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currentData, historyData] = await Promise.all([
        getEmployeeCurrentContract(employeeId),
        getEmployeeContractHistory(employeeId),
      ]);
      setCurrentContract(currentData);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, tCommon]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      await fetchData();
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Xử lý khi tạo/cập nhật thành công
  const handleSuccess = () => {
    setShowFormDialog(false);
    setEditingContract(null);
    fetchData();
  };

  // Xử lý khi click edit
  const handleEdit = (contract: EmploymentContract) => {
    setEditingContract(contract);
    setShowFormDialog(true);
  };

  // Xử lý khi click tạo mới
  const handleCreate = () => {
    setEditingContract(null);
    setShowFormDialog(true);
  };

  if (isLoading) {
    return <ContractsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Explanation Panel */}
      <ExplanationPanel
        title={t("guide.title")}
        description={t("guide.description")}
        tips={[
          t("guide.tip1"),
          t("guide.tip2"),
          t("guide.tip3"),
          t("guide.tip4"),
          t("guide.tip5"),
        ]}
        defaultCollapsed={true}
      />

      <div className="flex flex-col-reverse lg:flex-row gap-6">
        {/* Left: History Table */}
        <Card className="flex-1 min-w-0 pt-6 pb-0">
          <CardHeader>
            <CardTitle>{t("historyTitle") || "Lịch sử hợp đồng"}</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ContractHistory
              employeeId={employeeId}
              history={history}
              onEdit={handleEdit}
              onDeleted={fetchData}
            />
          </CardContent>
        </Card>

        {/* Right: Current Contract */}
        <Card className="lg:w-[360px] shrink-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("currentContract") || "Hợp đồng hiện tại"}</CardTitle>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("create")}
            </Button>
          </CardHeader>
          <CardContent>
            {currentContract ? (
              <CurrentContractCard
                contract={currentContract}
                onEdit={handleEdit}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {t("noContracts")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <ContractFormDialog
        open={showFormDialog}
        onClose={() => {
          setShowFormDialog(false);
          setEditingContract(null);
        }}
        onSuccess={handleSuccess}
        existingContract={editingContract}
        preselectedEmployee={employee}
        currentContract={currentContract}
      />
    </div>
  );
}

function ContractsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 min-w-0">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <Card className="lg:w-[360px] shrink-0">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

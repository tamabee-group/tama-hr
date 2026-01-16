"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmploymentContract } from "@/types/attendance-records";
import {
  getEmployeeCurrentContract,
  getEmployeeContractHistory,
} from "@/lib/apis/employee-detail-api";
import { ContractFormDialog } from "./_contract-form-dialog";
import { ContractHistory } from "./_contract-history";
import { CurrentContractCard } from "./_current-contract-card";

interface ContractsContentProps {
  employeeId: number;
}

export function ContractsContent({ employeeId }: ContractsContentProps) {
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
    fetchData();
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
      {/* Hint box */}
      <Collapsible>
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {tCommon("hint")}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                  <li>
                    {t("hint1") ||
                      "Mỗi nhân viên chỉ có 1 hợp đồng hiệu lực tại một thời điểm"}
                  </li>
                  <li>
                    {t("hint2") ||
                      "Hợp đồng mới sẽ tự động thay thế hợp đồng cũ khi có hiệu lực"}
                  </li>
                  <li>
                    {t("hint3") ||
                      "Có thể liên kết hợp đồng với cấu hình lương"}
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

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
        employeeId={employeeId}
        existingContract={editingContract}
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setEditingContract(null);
        }}
        onSuccess={handleSuccess}
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

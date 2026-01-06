"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAllowance } from "@/types/attendance-records";
import { getEmployeeAllowances } from "@/lib/apis/employee-allowance-api";
import { AllowanceList } from "./_allowance-list";
import { AllowanceAssignmentForm } from "./_allowance-assignment-form";

interface AllowancesContentProps {
  employeeId: number;
}

export function AllowancesContent({ employeeId }: AllowancesContentProps) {
  const t = useTranslations("allowances");
  const tCommon = useTranslations("common");

  const [allowances, setAllowances] = useState<EmployeeAllowance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAllowance, setEditingAllowance] =
    useState<EmployeeAllowance | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeAllowances(employeeId, 0, 100);
      setAllowances(response?.content || []);
    } catch (error) {
      console.error("Error fetching allowances:", error);
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
    setEditingAllowance(null);
    fetchData();
  };

  // Xử lý khi click edit
  const handleEdit = (allowance: EmployeeAllowance) => {
    setEditingAllowance(allowance);
    setShowForm(true);
  };

  // Xử lý khi click tạo mới
  const handleCreate = () => {
    setEditingAllowance(null);
    setShowForm(true);
  };

  // Xử lý khi hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingAllowance(null);
  };

  // Xử lý khi deactivate thành công
  const handleDeactivateSuccess = () => {
    fetchData();
  };

  if (isLoading) {
    return <AllowancesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Allowances Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("title")}</CardTitle>
          {!showForm && (
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("create")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm ? (
            <AllowanceAssignmentForm
              employeeId={employeeId}
              existingAllowance={editingAllowance}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : allowances.length > 0 ? (
            <AllowanceList
              allowances={allowances}
              onEdit={handleEdit}
              onDeactivateSuccess={handleDeactivateSuccess}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noAllowances")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AllowancesSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

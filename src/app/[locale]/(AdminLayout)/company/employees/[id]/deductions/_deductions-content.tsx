"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeDeduction } from "@/types/attendance-records";
import { getEmployeeDeductions } from "@/lib/apis/employee-deduction-api";
import { DeductionList } from "./_deduction-list";
import { DeductionAssignmentForm } from "./_deduction-assignment-form";

interface DeductionsContentProps {
  employeeId: number;
}

export function DeductionsContent({ employeeId }: DeductionsContentProps) {
  const t = useTranslations("deductions");
  const tCommon = useTranslations("common");

  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeduction, setEditingDeduction] =
    useState<EmployeeDeduction | null>(null);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeDeductions(employeeId, 0, 100);
      setDeductions(response?.content || []);
    } catch (error) {
      console.error("Error fetching deductions:", error);
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
    setEditingDeduction(null);
    fetchData();
  };

  // Xử lý khi click edit
  const handleEdit = (deduction: EmployeeDeduction) => {
    setEditingDeduction(deduction);
    setShowForm(true);
  };

  // Xử lý khi click tạo mới
  const handleCreate = () => {
    setEditingDeduction(null);
    setShowForm(true);
  };

  // Xử lý khi hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingDeduction(null);
  };

  // Xử lý khi deactivate thành công
  const handleDeactivateSuccess = () => {
    fetchData();
  };

  if (isLoading) {
    return <DeductionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Deductions Card */}
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
            <DeductionAssignmentForm
              employeeId={employeeId}
              existingDeduction={editingDeduction}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : deductions.length > 0 ? (
            <DeductionList
              deductions={deductions}
              onEdit={handleEdit}
              onDeactivateSuccess={handleDeactivateSuccess}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noDeductions")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeductionsSkeleton() {
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

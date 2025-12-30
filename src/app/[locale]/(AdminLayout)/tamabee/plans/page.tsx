"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { PlanResponse } from "@/types/plan";
import { planApi } from "@/lib/apis/plan-api";
import { PlanCard } from "./_plan-card";
import { PlanForm } from "./_plan-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Trang quản lý Plans cho Tamabee Admin
 * - Hiển thị danh sách plans dạng cards
 * - Nút thêm plan mới
 * - Edit/Delete plan
 */
export default function TamabeePlansPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanResponse | undefined>();

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<PlanResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Labels theo locale
  const labels = {
    vi: {
      title: "Quản lý gói dịch vụ",
      description: "Quản lý các gói subscription cho khách hàng",
      addPlan: "Thêm gói",
      refresh: "Làm mới",
      errorLoading: "Không thể tải danh sách gói dịch vụ",
      noPlans: "Chưa có gói dịch vụ nào",
      deleteTitle: "Xác nhận xóa",
      deleteDescription:
        "Bạn có chắc chắn muốn xóa gói dịch vụ này? Hành động này không thể hoàn tác.",
      deleteCancel: "Hủy",
      deleteConfirm: "Xóa",
      deleteSuccess: "Xóa gói dịch vụ thành công",
      deleteError: "Không thể xóa gói dịch vụ",
      planInUse: "Gói dịch vụ đang được sử dụng, không thể xóa",
    },
    en: {
      title: "Plan Management",
      description: "Manage subscription plans for customers",
      addPlan: "Add Plan",
      refresh: "Refresh",
      errorLoading: "Failed to load plans",
      noPlans: "No plans yet",
      deleteTitle: "Confirm Delete",
      deleteDescription:
        "Are you sure you want to delete this plan? This action cannot be undone.",
      deleteCancel: "Cancel",
      deleteConfirm: "Delete",
      deleteSuccess: "Plan deleted successfully",
      deleteError: "Failed to delete plan",
      planInUse: "Plan is in use and cannot be deleted",
    },
    ja: {
      title: "プラン管理",
      description: "顧客向けサブスクリプションプランの管理",
      addPlan: "プランを追加",
      refresh: "更新",
      errorLoading: "プランの読み込みに失敗しました",
      noPlans: "プランがまだありません",
      deleteTitle: "削除の確認",
      deleteDescription:
        "このプランを削除してもよろしいですか？この操作は元に戻せません。",
      deleteCancel: "キャンセル",
      deleteConfirm: "削除",
      deleteSuccess: "プランが正常に削除されました",
      deleteError: "プランの削除に失敗しました",
      planInUse: "プランは使用中のため削除できません",
    },
  };

  const t = labels[locale];

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await planApi.getAll(0, 100); // Lấy tất cả plans
      setPlans(response.content);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError(t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoading]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle add plan
  const handleAddPlan = () => {
    setEditingPlan(undefined);
    setFormOpen(true);
  };

  // Handle edit plan
  const handleEditPlan = (plan: PlanResponse) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  // Handle delete plan
  const handleDeletePlan = (plan: PlanResponse) => {
    setDeletingPlan(plan);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingPlan) return;

    setIsDeleting(true);
    try {
      await planApi.delete(deletingPlan.id);
      toast.success(t.deleteSuccess);
      setDeleteDialogOpen(false);
      setDeletingPlan(null);
      fetchPlans();
    } catch (error: unknown) {
      console.error("Failed to delete plan:", error);
      // Kiểm tra nếu plan đang được sử dụng
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        errorMessage.includes("in use") ||
        errorMessage.includes("CONFLICT")
      ) {
        toast.error(t.planInUse);
      } else {
        toast.error(t.deleteError);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlans}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t.refresh}
          </Button>
          <Button size="sm" onClick={handleAddPlan}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addPlan}
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border p-6 text-center text-destructive">
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">{t.noPlans}</p>
          <Button onClick={handleAddPlan} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t.addPlan}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              locale={locale}
              showActions={true}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => handleDeletePlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Plan Form Dialog */}
      <PlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editingPlan}
        onSuccess={handleFormSuccess}
        locale={locale}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t.deleteCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

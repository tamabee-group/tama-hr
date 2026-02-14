"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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

export default function AdminPlansPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanResponse | undefined>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<PlanResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await planApi.getAll(0, 100);
      setPlans(response.content);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError(tCommon("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPlan = () => {
    setEditingPlan(undefined);
    setFormOpen(true);
  };

  const handleEditPlan = (plan: PlanResponse) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleDeletePlan = (plan: PlanResponse) => {
    setDeletingPlan(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPlan) return;

    setIsDeleting(true);
    try {
      await planApi.delete(deletingPlan.id);
      toast.success(t("messages.deleteSuccess"));
      setDeleteDialogOpen(false);
      setDeletingPlan(null);
      fetchPlans();
    } catch (error: unknown) {
      console.error("Failed to delete plan:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        errorMessage.includes("in use") ||
        errorMessage.includes("CONFLICT")
      ) {
        toast.error(t("messages.planInUse"));
      } else {
        toast.error(t("messages.deleteError"));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPlans}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
        <Button size="sm" onClick={handleAddPlan}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addPlan")}
        </Button>
      </div>

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
          <p className="text-muted-foreground">{t("noPlans")}</p>
          <Button onClick={handleAddPlan} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t("addPlan")}
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

      <PlanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editingPlan}
        onSuccess={handleFormSuccess}
        locale={locale}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

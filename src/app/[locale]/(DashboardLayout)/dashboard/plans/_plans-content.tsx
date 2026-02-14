"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PlanCards } from "@/app/[locale]/_components/plan-cards";
import { changePlan, cancelUpgrade } from "@/lib/apis/subscription";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate, formatDateForApi } from "@/lib/utils/format-date-time";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format-currency";
import { PlanEligibility } from "@/types/subscription";
import { ExplanationPanel } from "../../../_components/_explanation-panel";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface PlansContentProps {
  currentPlanId: number | null;
  currentPlanPrice: number | null;
  isInFreeTrial: boolean;
  scheduledPlanId: number | null;
  scheduledPlanName: string | null;
  scheduledPlanEffectiveDate: string | null;
  canCancelUpgrade: boolean;
  cancelUpgradeDeadline: string | null;
  previousPlanName: string | null;
  availablePlans: PlanEligibility[];
  onPlanChanged?: () => void;
}

type ChangeType = "UPGRADE" | "DOWNGRADE" | "TRIAL_CHANGE";

export function PlansContent({
  currentPlanId,
  currentPlanPrice,
  isInFreeTrial,
  scheduledPlanId,
  scheduledPlanName,
  scheduledPlanEffectiveDate,
  canCancelUpgrade,
  cancelUpgradeDeadline,
  previousPlanName,
  availablePlans,
  onPlanChanged,
}: PlansContentProps) {
  const router = useRouter();
  const t = useTranslations("plans");
  const tErrors = useTranslations("errors");
  const [changing, setChanging] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    planId: number | null;
    planName: string;
    planPrice: number;
    changeType: ChangeType;
  }>({
    open: false,
    planId: null,
    planName: "",
    planPrice: 0,
    changeType: "UPGRADE",
  });

  const getChangeType = (newPlanPrice: number): ChangeType => {
    if (isInFreeTrial) return "TRIAL_CHANGE";
    const currentPrice = currentPlanPrice || 0;
    if (newPlanPrice > currentPrice) return "UPGRADE";
    return "DOWNGRADE";
  };

  const handleSelectPlan = (planId: number) => {
    if (planId === currentPlanId) return;
    const selectedPlan = availablePlans.find((p) => p.id === planId);
    if (!selectedPlan) return;
    const changeType = getChangeType(selectedPlan.monthlyPrice);
    setConfirmDialog({
      open: true,
      planId,
      planName: selectedPlan.name,
      planPrice: selectedPlan.monthlyPrice,
      changeType,
    });
  };

  const handleConfirmChange = async () => {
    if (!confirmDialog.planId) return;
    setChanging(true);
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    try {
      await changePlan(confirmDialog.planId);
      if (confirmDialog.changeType === "DOWNGRADE") {
        toast.success(t("messages.downgradeScheduled"));
      } else {
        toast.success(t("messages.changeSuccess"));
      }
      onPlanChanged?.();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, tErrors, t("messages.changeError")));
    } finally {
      setChanging(false);
    }
  };

  const handleCancelUpgrade = async () => {
    setCanceling(true);
    try {
      await cancelUpgrade();
      toast.success(t("messages.cancelUpgradeSuccess"));
      onPlanChanged?.();
      router.refresh();
    } catch (error) {
      toast.error(
        getErrorMessage(error, tErrors, t("messages.cancelUpgradeError")),
      );
    } finally {
      setCanceling(false);
    }
  };

  const getNextBillingDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return formatDateForApi(nextMonth) || "";
  };

  return (
    <div
      className={changing || canceling ? "pointer-events-none opacity-70" : ""}
    >
      <ExplanationPanel
        title={t("guide.title")}
        description={t("guide.description")}
        tips={[
          t("guide.tip1"),
          t("guide.tip2"),
          t("guide.tip3"),
          t("guide.tip4"),
        ]}
        defaultCollapsed={true}
        className="mb-6"
      />

      {canCancelUpgrade && previousPlanName && cancelUpgradeDeadline && (
        <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-orange-800 dark:text-orange-200">
              {t("cancelUpgrade.message", {
                planName: previousPlanName,
                deadline: formatDate(cancelUpgradeDeadline),
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelUpgrade}
              disabled={canceling}
              className="ml-4 border-orange-500 text-orange-700 hover:bg-orange-100"
            >
              {t("cancelUpgrade.button")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {scheduledPlanId && scheduledPlanName && scheduledPlanEffectiveDate && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {t("scheduledDowngrade", {
              planName: scheduledPlanName,
              effectiveDate: formatDate(scheduledPlanEffectiveDate),
            })}
          </AlertDescription>
        </Alert>
      )}

      <PlanCards
        currentPlanId={currentPlanId}
        onSelectPlan={handleSelectPlan}
      />

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.changeType === "UPGRADE"
                ? t("confirm.upgradeTitle")
                : confirmDialog.changeType === "DOWNGRADE"
                  ? t("confirm.downgradeTitle")
                  : t("confirm.changeTitle")}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4" asChild>
              <div className="text-sm text-muted-foreground space-y-3 pt-4">
                <div>
                  {t("confirm.newPlan")}:{" "}
                  <strong>{confirmDialog.planName}</strong> (
                  {formatCurrency(confirmDialog.planPrice)}
                  {t("perMonth")})
                </div>

                {confirmDialog.changeType === "UPGRADE" && (
                  <>
                    <div className="text-green-600 dark:text-green-400">
                      {t("confirm.upgradeImmediate")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("confirm.upgradeBillingNote")}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {t("confirm.upgradeGracePeriod")}
                    </div>
                  </>
                )}

                {confirmDialog.changeType === "DOWNGRADE" && (
                  <>
                    <div className="text-yellow-600 dark:text-yellow-400">
                      {t("confirm.downgradeScheduled", {
                        effectiveDate: formatDate(getNextBillingDate()),
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("confirm.downgradeBillingNote")}
                    </div>
                  </>
                )}

                {confirmDialog.changeType === "TRIAL_CHANGE" && (
                  <div className="text-blue-600 dark:text-blue-400">
                    {t("confirm.trialChange")}
                  </div>
                )}

                {scheduledPlanId &&
                  confirmDialog.changeType !== "DOWNGRADE" && (
                    <div className="text-orange-600 dark:text-orange-400 text-sm">
                      {t("confirm.cancelScheduledDowngrade")}
                    </div>
                  )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              {t("confirm.cancel")}
            </Button>
            <Button onClick={handleConfirmChange}>
              {t("confirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

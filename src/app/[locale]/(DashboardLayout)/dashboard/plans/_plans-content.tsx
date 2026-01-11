"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PlanCards } from "@/app/[locale]/_components/plan-cards";
import { changePlan } from "@/lib/apis/subscription";
import { toast } from "sonner";

interface PlansContentProps {
  currentPlanId: number | null;
}

export function PlansContent({ currentPlanId }: PlansContentProps) {
  const router = useRouter();
  const t = useTranslations("plans");
  const [changing, setChanging] = useState(false);

  const handleSelectPlan = async (planId: number) => {
    if (planId === currentPlanId) return;

    setChanging(true);
    try {
      await changePlan(planId);
      toast.success(t("messages.changeSuccess"));
      router.refresh();
    } catch {
      toast.error(t("messages.changeError"));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className={changing ? "pointer-events-none opacity-70" : ""}>
      <PlanCards
        currentPlanId={currentPlanId}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}

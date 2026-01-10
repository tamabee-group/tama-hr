"use client";

import { useTranslations } from "next-intl";
import { PublicSettings } from "@/lib/apis/plan-api";
import { Gift } from "lucide-react";

interface FreeTrialBadgeProps {
  settings: PublicSettings;
}

export function FreeTrialBadge({ settings }: FreeTrialBadgeProps) {
  const t = useTranslations("landing.hero");

  return (
    <div className="flex flex-col sm:flex-row gap-2 text-sm">
      <span className="text-gray-600 dark:text-gray-400">
        {t("freeTrialInfo", { months: settings.freeTrialMonths })}
      </span>
      {settings.referralBonusMonths > 0 && (
        <span className="flex items-center gap-1 text-primary font-medium">
          <Gift className="w-4 h-4" />
          {t("referralBonus", { months: settings.referralBonusMonths })}
        </span>
      )}
    </div>
  );
}

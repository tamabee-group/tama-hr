"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Star, Users } from "lucide-react";
import {
  PlanResponse,
  getPlanName,
  getPlanDescription,
  getFeatureText,
  LocaleKey,
} from "@/types/plan";
import {
  getActivePlans,
  PublicSettings,
  getPublicSettings,
} from "@/lib/apis/plan-api";
import {
  formatPriceWithConversion,
  SupportedLocale,
} from "@/lib/utils/format-currency";

const CUSTOM_PLAN_ID = 4;

interface PlanCardsProps {
  currentPlanId?: number | null;
  onSelectPlan?: (planId: number) => void;
  showRegisterButton?: boolean;
  disabledPlanIds?: number[];
}

export function PlanCards({
  currentPlanId,
  onSelectPlan,
  showRegisterButton = false,
  disabledPlanIds = [],
}: PlanCardsProps) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("plans");

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, settingsData] = await Promise.all([
          getActivePlans(),
          getPublicSettings(),
        ]);
        // Lọc bỏ Free Plan (id=0)
        setPlans(plansData.filter((p) => p.id !== 0));
        setSettings(settingsData);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          locale={locale}
          settings={settings}
          isCurrentPlan={plan.id === currentPlanId}
          isDisabled={disabledPlanIds.includes(plan.id)}
          showRegisterButton={showRegisterButton}
          onSelect={onSelectPlan ? () => onSelectPlan(plan.id) : undefined}
          t={t}
        />
      ))}
    </div>
  );
}

interface PlanCardProps {
  plan: PlanResponse;
  locale: SupportedLocale;
  settings: PublicSettings | null;
  isCurrentPlan: boolean;
  isDisabled: boolean;
  showRegisterButton: boolean;
  onSelect?: () => void;
  t: ReturnType<typeof useTranslations>;
}

function PlanCard({
  plan,
  locale,
  settings,
  isCurrentPlan,
  isDisabled,
  showRegisterButton,
  onSelect,
  t,
}: PlanCardProps) {
  const localeKey = locale as LocaleKey;
  const sortedFeatures = [...plan.features].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const isCustomPlan = plan.id === CUSTOM_PLAN_ID;
  const customPrice = settings?.customPricePerEmployee || 0;

  return (
    <div
      className={`bg-card border rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow ${
        isCurrentPlan ? "border-primary ring-2 ring-primary/20" : ""
      } ${isDisabled ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold">
          {getPlanName(plan, localeKey)}
        </h3>
        {isCurrentPlan && (
          <Badge variant="default" className="text-xs">
            {t("current")}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {getPlanDescription(plan, localeKey)}
      </p>

      {/* Price */}
      <div className="mb-4">
        {isCustomPlan ? (
          <PriceDisplay
            amountJPY={customPrice}
            locale={locale}
            suffix={t("perEmployee")}
          />
        ) : (
          <PriceDisplay
            amountJPY={plan.monthlyPrice}
            locale={locale}
            suffix={t("perMonth")}
          />
        )}
      </div>

      {/* Max Employees */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b">
        <Users className="w-4 h-4" />
        <span>
          {isCustomPlan
            ? t("unlimited")
            : `${t("maxEmployees")}: ${plan.maxEmployees}`}
        </span>
      </div>

      {/* Features */}
      <div className="flex-1 mb-6">
        <p className="text-sm font-medium mb-3">{t("features")}:</p>
        <ul className="space-y-2">
          {sortedFeatures.slice(0, 5).map((feature) => (
            <li
              key={feature.id}
              className={`flex items-start gap-2 text-sm ${
                feature.isHighlighted
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {feature.isHighlighted ? (
                <Star className="w-4 h-4 mt-0.5 fill-primary shrink-0" />
              ) : (
                <Check className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{getFeatureText(feature, localeKey)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      {onSelect && (
        <Button
          onClick={onSelect}
          className="w-full rounded-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isDisabled}
        >
          {isCurrentPlan
            ? t("currentPlan")
            : isCustomPlan
              ? t("contactUs")
              : showRegisterButton
                ? t("registerNow")
                : t("selectPlan")}
        </Button>
      )}

      {/* Disabled reason */}
      {isDisabled && !isCurrentPlan && (
        <p className="text-xs text-destructive mt-2 text-center">
          {t("exceedsLimit")}
        </p>
      )}
    </div>
  );
}

function PriceDisplay({
  amountJPY,
  locale,
  suffix,
}: {
  amountJPY: number;
  locale: SupportedLocale;
  suffix: string;
}) {
  const { jpy, converted } = formatPriceWithConversion(amountJPY, locale);

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-primary">{jpy}</span>
        <span className="text-muted-foreground text-sm">{suffix}</span>
      </div>
      {converted && (
        <span className="text-sm text-muted-foreground">(~{converted})</span>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  PlanResponse,
  getPlanName,
  getPlanDescription,
  getFeatureText,
  LocaleKey,
} from "@/types/plan";
import { getActivePlans, PublicSettings } from "@/lib/apis/plan-api";
import {
  formatPriceWithConversion,
  SupportedLocale,
} from "@/lib/utils/format-currency";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Star, Users } from "lucide-react";

// Custom plan ID
const CUSTOM_PLAN_ID = 4;

interface PricingSectionProps {
  settings: PublicSettings;
}

export function PricingSection({ settings }: PricingSectionProps) {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("landing.pricing");

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plansData = await getActivePlans();
        // Lọc bỏ Free Plan (id=0), chỉ hiển thị plans trả phí
        setPlans(plansData.filter((p) => p.id !== 0));
      } catch {
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const handleSelectPlan = (planId: number) => {
    router.push(`/${locale}/register?planId=${planId}`);
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="py-20 bg-background relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("freeTrialNote", { months: settings.freeTrialMonths })}
          </p>
          {settings.referralBonusMonths > 0 && (
            <p className="text-sm text-primary mt-1">
              {t("referralBonus", { months: settings.referralBonusMonths })}
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              locale={locale}
              settings={settings}
              t={t}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  locale,
  settings,
  t,
  onSelect,
}: {
  plan: PlanResponse;
  locale: SupportedLocale;
  settings: PublicSettings;
  t: ReturnType<typeof useTranslations>;
  onSelect: () => void;
}) {
  const localeKey = locale as LocaleKey;
  const sortedFeatures = [...plan.features].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const isCustomPlan = plan.id === CUSTOM_PLAN_ID;
  const customPrice = settings.customPricePerEmployee;

  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow">
      {/* Plan Name */}
      <h3 className="text-lg font-semibold mb-1">
        {getPlanName(plan, localeKey)}
      </h3>
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
            : `${t("maxEmployees")} ${plan.maxEmployees}`}
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
      <Button onClick={onSelect} className="w-full rounded-full">
        {isCustomPlan ? t("contactUs") : t("registerNow")}
      </Button>
    </div>
  );
}

// Component hiển thị giá với quy đổi tiền tệ
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

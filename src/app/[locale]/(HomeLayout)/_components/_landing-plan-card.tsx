"use client";

import {
  PlanResponse,
  getPlanName,
  getPlanDescription,
  getFeatureText,
  LocaleKey,
} from "@/types/plan";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Check, Users, Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface LandingPlanCardProps {
  plan: PlanResponse;
  locale?: SupportedLocale;
  onSelect?: () => void;
}

/**
 * Plan Card cho Landing Page
 * - Hiển thị name, description, price, features theo locale
 * - Nút "Đăng ký" navigate đến register với planId
 * - Highlighted features nổi bật
 */
export function LandingPlanCard({
  plan,
  locale = "vi",
  onSelect,
}: LandingPlanCardProps) {
  const t = useTranslations("landing.pricing");
  const localeKey = locale as LocaleKey;

  const sortedFeatures = [...plan.features].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <GlassCard className="flex flex-col h-full p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="space-y-1.5 mb-4">
        <h3 className="text-xl font-semibold leading-none tracking-tight">
          {getPlanName(plan, localeKey)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {getPlanDescription(plan, localeKey)}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-baseline gap-1">
          {plan.monthlyPrice === 0 ? (
            <span className="text-3xl font-bold text-green-600">
              {t("free")}
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(plan.monthlyPrice)}
              </span>
              <span className="text-muted-foreground">{t("perMonth")}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {t("maxEmployees")}: {plan.maxEmployees}
          </span>
        </div>

        {sortedFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("features")}:</p>
            <ul className="space-y-2">
              {sortedFeatures.map((feature) => (
                <li
                  key={feature.id}
                  className={`flex items-start gap-2 text-sm ${
                    feature.isHighlighted
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {feature.isHighlighted ? (
                    <Star className="h-4 w-4 mt-0.5 fill-primary" />
                  ) : (
                    <Check className="h-4 w-4 mt-0.5" />
                  )}
                  <span>{getFeatureText(feature, localeKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-white/10">
        <Button onClick={onSelect} className="w-full" size="lg">
          {t("registerNow")}
        </Button>
      </div>
    </GlassCard>
  );
}

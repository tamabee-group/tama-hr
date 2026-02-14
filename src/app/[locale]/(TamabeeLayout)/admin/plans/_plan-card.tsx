"use client";

import { useTranslations } from "next-intl";
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
import { Badge } from "@/components/ui/badge";
import { Check, Edit, Trash2, Users, Star } from "lucide-react";

interface PlanCardProps {
  plan: PlanResponse;
  locale?: SupportedLocale;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  isDeleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

export function PlanCard({
  plan,
  locale = "vi",
  showActions = false,
  onEdit,
  onDelete,
  onSelect,
  isDeleteDisabled = false,
  deleteDisabledReason,
}: PlanCardProps) {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
  const localeKey = locale as LocaleKey;

  const sortedFeatures = [...plan.features].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <GlassCard className="flex flex-col h-full p-0">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">
              {getPlanName(plan, localeKey)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getPlanDescription(plan, localeKey)}
            </p>
          </div>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? t("card.active") : t("card.inactive")}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-4 space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(plan.monthlyPrice)}
          </span>
          <span className="text-muted-foreground">{t("card.perMonth")}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {t("card.maxEmployees")}: {plan.maxEmployees}
          </span>
        </div>

        {sortedFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("table.features")}:</p>
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
      <div className="flex gap-2 p-6 pt-4 border-t border-gray-200/50 dark:border-white/10">
        {onSelect && (
          <Button onClick={onSelect} className="flex-1">
            {t("card.select")}
          </Button>
        )}

        {showActions && (
          <>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                {tCommon("edit")}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleteDisabled}
                title={isDeleteDisabled ? deleteDisabledReason : undefined}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {tCommon("delete")}
              </Button>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
}

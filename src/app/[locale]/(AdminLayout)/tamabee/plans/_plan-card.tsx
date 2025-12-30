"use client";

import {
  PlanResponse,
  getPlanName,
  getPlanDescription,
  getFeatureText,
  LocaleKey,
} from "@/types/plan";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

/**
 * Component hiển thị thông tin gói dịch vụ
 * - Hiển thị name, description, price, features theo locale
 * - Edit, Delete buttons (admin only)
 * - Badge isActive
 * - Highlighted features nổi bật
 */
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
  const localeKey = locale as LocaleKey;

  // Labels theo locale
  const labels = {
    vi: {
      perMonth: "/tháng",
      maxEmployees: "Tối đa nhân viên",
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      edit: "Sửa",
      delete: "Xóa",
      select: "Chọn gói này",
      features: "Tính năng",
    },
    en: {
      perMonth: "/month",
      maxEmployees: "Max employees",
      active: "Active",
      inactive: "Inactive",
      edit: "Edit",
      delete: "Delete",
      select: "Select this plan",
      features: "Features",
    },
    ja: {
      perMonth: "/月",
      maxEmployees: "最大従業員数",
      active: "有効",
      inactive: "無効",
      edit: "編集",
      delete: "削除",
      select: "このプランを選択",
      features: "機能",
    },
  };

  const t = labels[locale];

  // Sắp xếp features theo sortOrder
  const sortedFeatures = [...plan.features].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {getPlanName(plan, localeKey)}
            </CardTitle>
            <CardDescription>
              {getPlanDescription(plan, localeKey)}
            </CardDescription>
          </div>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? t.active : t.inactive}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Giá */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(plan.monthlyPrice, locale)}
          </span>
          <span className="text-muted-foreground">{t.perMonth}</span>
        </div>

        {/* Max employees */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {t.maxEmployees}: {plan.maxEmployees}
          </span>
        </div>

        {/* Features list */}
        {sortedFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t.features}:</p>
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
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        {/* Select button cho landing page */}
        {onSelect && (
          <Button onClick={onSelect} className="flex-1">
            {t.select}
          </Button>
        )}

        {/* Admin actions */}
        {showActions && (
          <>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                {t.edit}
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
                {t.delete}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

"use client";

import { useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Badge } from "@/components/ui/badge";
import { SettingResponse } from "@/types/setting";
import { PlanResponse, getPlanName, LocaleKey } from "@/types/plan";
import { formatCurrency } from "@/lib/utils/format-currency";

interface SettingsTableProps {
  settings: SettingResponse[];
  plans: PlanResponse[];
  onRowClick: (setting: SettingResponse) => void;
}

// Nhóm settings theo category
const SETTING_GROUPS: Record<string, string[]> = {
  trial: ["FREE_TRIAL_MONTHS", "REFERRAL_BONUS_MONTHS", "DEFAULT_PLAN_ID"],
  referral: ["COMMISSION_AMOUNT", "CUSTOM_PRICE_PER_EMPLOYEE"],
  banking: [
    "MIN_DEPOSIT_AMOUNT",
    "BANK_NAME",
    "BANK_ACCOUNT",
    "BANK_ACCOUNT_NAME",
  ],
};

// Lấy group của setting
const getSettingGroup = (key: string): string => {
  for (const [group, keys] of Object.entries(SETTING_GROUPS)) {
    if (keys.includes(key)) return group;
  }
  return "other";
};

export function SettingsTable({
  settings,
  plans,
  onRowClick,
}: SettingsTableProps) {
  const t = useTranslations("tamabeeSettings");
  const tCommon = useTranslations("common");
  const locale = useLocale() as LocaleKey;

  // Format giá trị hiển thị
  const formatValue = useCallback(
    (setting: SettingResponse): string => {
      const { settingKey, settingValue, valueType } = setting;

      // Plan ID -> Plan name
      if (settingKey === "DEFAULT_PLAN_ID") {
        const plan = plans.find((p) => String(p.id) === settingValue);
        return plan ? getPlanName(plan, locale) : settingValue;
      }

      // Currency values
      if (
        settingKey === "COMMISSION_AMOUNT" ||
        settingKey === "MIN_DEPOSIT_AMOUNT" ||
        settingKey === "CUSTOM_PRICE_PER_EMPLOYEE"
      ) {
        return formatCurrency(Number(settingValue));
      }

      // Months
      if (
        settingKey === "FREE_TRIAL_MONTHS" ||
        settingKey === "REFERRAL_BONUS_MONTHS"
      ) {
        return `${settingValue} ${t("units.months")}`;
      }

      // Default
      if (valueType === "INTEGER" || valueType === "DECIMAL") {
        return settingValue;
      }

      return settingValue;
    },
    [plans, locale, t],
  );

  // Columns definition
  const columns: ColumnDef<SettingResponse>[] = useMemo(
    () => [
      {
        accessorKey: "index",
        header: () => <div className="w-[60px]">STT</div>,
        cell: ({ row }) => (
          <div className="w-[60px] text-center">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: "settingKey",
        header: t("table.name"),
        cell: ({ row }) => (
          <div className="font-medium">
            {t(`keys.${row.original.settingKey}`)}
          </div>
        ),
      },
      {
        accessorKey: "settingValue",
        header: t("table.value"),
        cell: ({ row }) => (
          <div className="font-mono">{formatValue(row.original)}</div>
        ),
      },
      {
        accessorKey: "group",
        header: t("table.group"),
        cell: ({ row }) => {
          const group = getSettingGroup(row.original.settingKey);
          return <Badge variant="outline">{t(`groups.${group}`)}</Badge>;
        },
      },
    ],
    [t, formatValue],
  );

  return (
    <BaseTable
      columns={columns}
      data={settings}
      onRowClick={onRowClick}
      showPagination={false}
      noResultsText={tCommon("noData")}
    />
  );
}

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { useAuth } from "@/hooks/use-auth";
import { formatPayslip } from "@/lib/utils/format-currency";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import type { MonthlyPayroll } from "@/lib/apis/dashboard-api";

interface PayrollOverviewChartProps {
  data: MonthlyPayroll[];
}

/**
 * Format tháng ngắn gọn cho trục X chart
 * Input: "2026-02" → vi/en: "02/2026", ja: "2026/02"
 */
function formatShortMonth(monthStr: string, locale: SupportedLocale): string {
  const parts = monthStr.split("-");
  if (parts.length !== 2) return monthStr;
  const [year, month] = parts;
  if (locale === "ja") return `${year}/${month}`;
  return `${month}/${year}`;
}

/**
 * Biểu đồ tổng hợp lương 6 tháng gần nhất
 */
export function PayrollOverviewChart({ data }: PayrollOverviewChartProps) {
  const t = useTranslations("dashboard.stats");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const locale = (user?.locale || "vi") as SupportedLocale;

  const hasData = data.some((d) => d.totalGross > 0 || d.totalNet > 0);

  const chartData = data.map((d) => ({
    month: formatShortMonth(d.month, locale),
    [t("grossSalary")]: d.totalGross,
    [t("netSalary")]: d.totalNet,
  }));

  // Format giá trị trục Y
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  // Format tooltip hiển thị tiền lương
  const formatTooltipValue = (value: number | undefined) =>
    formatPayslip(value ?? 0, locale);

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("payrollOverview")}
        </h3>
        <Link
          href="/dashboard/payroll"
          className="text-xs text-primary hover:underline"
        >
          {tCommon("viewDetail")}
        </Link>
      </div>
      {!hasData ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("noData")}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ left: -10, right: 5 }}>
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" fontSize={11} tickMargin={4} />
            <YAxis fontSize={11} tickFormatter={formatYAxis} width={40} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey={t("grossSalary")}
              stroke="#3b82f6"
              fill="url(#grossGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey={t("netSalary")}
              stroke="#22c55e"
              fill="url(#netGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}

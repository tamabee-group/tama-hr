"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";

interface MonthlyLeaveChartProps {
  approved: number;
  rejected: number;
  pending: number;
}

const COLORS = ["#22c55e", "#ef4444", "#eab308"];

/**
 * Biểu đồ tròn phân bổ nghỉ phép tháng này
 */
export function MonthlyLeaveChart({
  approved,
  rejected,
  pending,
}: MonthlyLeaveChartProps) {
  const t = useTranslations("dashboard.stats");
  const tCommon = useTranslations("common");

  const total = approved + rejected + pending;

  const data = [
    { name: t("approved"), value: approved },
    { name: t("rejected"), value: rejected },
    { name: t("pending"), value: pending },
  ];

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("monthlyLeave")}
        </h3>
        <Link
          href="/dashboard/leaves"
          className="text-xs text-primary hover:underline"
        >
          {tCommon("viewDetail")}
        </Link>
      </div>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("noData")}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value, entry) => {
                const item = data.find((d) => d.name === value);
                return `${value} (${item?.value ?? (entry.payload as { value?: number })?.value ?? 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}

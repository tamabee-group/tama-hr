"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { useAuth } from "@/hooks/use-auth";
import type { DailyAttendance } from "@/lib/apis/dashboard-api";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface WeeklyAttendanceChartProps {
  data: DailyAttendance[];
}

/**
 * Format ngày ngắn gọn cho trục X chart
 * Input: "2026-02-07" → vi/en: "07/02", ja: "02/07"
 */
function formatShortDate(dateStr: string, locale: SupportedLocale): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const month = parts[1];
  const day = parts[2];
  if (locale === "ja") return `${month}/${day}`;
  return `${day}/${month}`;
}

/**
 * Biểu đồ cột chấm công 7 ngày gần nhất
 */
export function WeeklyAttendanceChart({ data }: WeeklyAttendanceChartProps) {
  const t = useTranslations("dashboard.stats");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const locale = (user?.locale || "vi") as SupportedLocale;

  const chartData = data.map((d) => ({
    date: formatShortDate(d.date, locale),
    [t("present")]: d.present,
    [t("late")]: d.late,
    [t("absent")]: d.absent,
    [t("onLeave")]: d.onLeave,
  }));

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("weeklyAttendance")}
        </h3>
        <Link
          href="/dashboard/attendance"
          className="text-xs text-primary hover:underline"
        >
          {tCommon("viewDetail")}
        </Link>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("noData")}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ left: -10, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={11} tickMargin={4} />
            <YAxis fontSize={11} allowDecimals={false} width={30} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={t("present")} fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey={t("late")} fill="#eab308" radius={[3, 3, 0, 0]} />
            <Bar dataKey={t("absent")} fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey={t("onLeave")} fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}

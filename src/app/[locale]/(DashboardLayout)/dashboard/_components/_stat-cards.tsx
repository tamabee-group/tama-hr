"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import type { DashboardStats } from "@/lib/apis/dashboard-api";

interface StatCardsProps {
  stats: DashboardStats;
}

/**
 * Cards thống kê tổng quan: nhân sự, chấm công hôm nay, yêu cầu chờ duyệt
 * Click vào card sẽ điều hướng đến trang tương ứng
 */
export function StatCards({ stats }: StatCardsProps) {
  const t = useTranslations("dashboard.stats");
  const router = useRouter();

  const cards = [
    {
      label: t("totalEmployees"),
      value: stats.totalEmployees,
      sub: `${stats.activeEmployees} ${t("activeEmployees")}`,
      color: "text-blue-600 dark:text-blue-400",
      href: "/dashboard/employees",
    },
    {
      label: t("present"),
      value: stats.todayPresent,
      sub: `${t("todayAttendance")}`,
      color: "text-green-600 dark:text-green-400",
      href: "/dashboard/attendance",
    },
    {
      label: t("late"),
      value: stats.todayLate,
      sub: `${stats.todayAbsent} ${t("absent")}`,
      color: "text-yellow-600 dark:text-yellow-400",
      href: "/dashboard/attendance",
    },
    {
      label: t("pendingRequests"),
      value: stats.pendingLeaveRequests + stats.pendingAdjustmentRequests,
      sub: `${stats.pendingLeaveRequests} ${t("pendingLeave")}`,
      color: "text-red-600 dark:text-red-400",
      href: "/dashboard/leaves",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <GlassCard
          key={card.label}
          className="p-3 sm:p-4 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push(card.href)}
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            {card.label}
          </p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
        </GlassCard>
      ))}
    </div>
  );
}

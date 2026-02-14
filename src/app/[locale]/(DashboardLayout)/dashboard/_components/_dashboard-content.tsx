"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/apis/dashboard-api";
import { Spinner } from "@/components/ui/spinner";
import { StatCards } from "./_stat-cards";
import { WeeklyAttendanceChart } from "./_weekly-attendance-chart";
import { MonthlyLeaveChart } from "./_monthly-leave-chart";
import { PayrollOverviewChart } from "./_payroll-overview-chart";

/**
 * Nội dung trang bảng điều khiển
 * Fetch data từ API và hiển thị thống kê + biểu đồ
 */
export function DashboardContent() {
  const t = useTranslations("dashboard.stats");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      // Lỗi sẽ được xử lý bởi apiClient
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground text-center py-20">
        {t("noData")}
      </p>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Thống kê tổng quan */}
      <StatCards stats={stats} />

      {/* Chấm công 7 ngày */}
      <WeeklyAttendanceChart data={stats.weeklyAttendance} />

      {/* Nghỉ phép + Lương */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MonthlyLeaveChart
          approved={stats.monthlyLeaveApproved}
          rejected={stats.monthlyLeaveRejected}
          pending={stats.monthlyLeavePending}
        />
        <PayrollOverviewChart data={stats.payrollOverview} />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Calendar, ArrowLeftRight, History } from "lucide-react";
import { toast } from "sonner";
import { formatDateForApi } from "@/lib/utils/format-date-time";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style/_glass-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShiftList } from "./_shift-list";
import { SwapRequestForm } from "./_swap-request-form";
import { SwapHistory } from "./_swap-history";
import { shiftApi, EmployeeScheduleData } from "@/lib/apis/shift-api";
import type { ShiftAssignment } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

type DateRangeType = "week" | "month" | "prevMonth" | "nextMonth";

interface CachedData {
  data: EmployeeScheduleData;
  startDate: string;
  endDate: string;
}

// ============================================
// Component
// ============================================

export function ScheduleContent() {
  const t = useTranslations("portal.schedule");

  // State
  const [cachedData, setCachedData] = React.useState<CachedData | null>(null);
  const [filteredShifts, setFilteredShifts] = React.useState<ShiftAssignment[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState<DateRangeType>("week");
  const [activeTab, setActiveTab] = React.useState("shifts");

  // Tabs config
  const tabs = [
    {
      value: "shifts",
      label: t("shifts"),
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: "swap",
      label: t("requestSwap"),
      icon: <ArrowLeftRight className="h-4 w-4" />,
    },
    {
      value: "history",
      label: t("history"),
      icon: <History className="h-4 w-4" />,
    },
  ];

  // Tính date range cho từng option
  const getDateRangeForType = React.useCallback((type: DateRangeType) => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (type) {
      case "week":
        const dayOfWeek = today.getDay();
        startDate.setDate(today.getDate() - dayOfWeek);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "month":
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        break;
      case "prevMonth":
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0);
        break;
      case "nextMonth":
        startDate.setMonth(startDate.getMonth() + 1);
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 2);
        endDate.setDate(0);
        break;
    }

    return {
      startDate: formatDateForApi(startDate) || "",
      endDate: formatDateForApi(endDate) || "",
    };
  }, []);

  // Kiểm tra xem date range có nằm trong cached data không
  const isRangeInCache = React.useCallback(
    (type: DateRangeType) => {
      if (!cachedData) return false;
      const { startDate, endDate } = getDateRangeForType(type);
      return startDate >= cachedData.startDate && endDate <= cachedData.endDate;
    },
    [cachedData, getDateRangeForType],
  );

  // Lọc shifts từ cache theo date range
  const filterShiftsFromCache = React.useCallback(
    (type: DateRangeType) => {
      if (!cachedData) return [];
      const { startDate, endDate } = getDateRangeForType(type);
      return cachedData.data.shifts.filter(
        (shift) => shift.workDate >= startDate && shift.workDate <= endDate,
      );
    },
    [cachedData, getDateRangeForType],
  );

  // Fetch data
  const fetchData = React.useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && cachedData && isRangeInCache(dateRange)) {
        setFilteredShifts(filterShiftsFromCache(dateRange));
        return;
      }

      try {
        setLoading(true);

        // Nếu là week thì fetch cả month để cache
        let fetchType = dateRange;
        if (dateRange === "week") {
          fetchType = "month";
        }

        const { startDate, endDate } = getDateRangeForType(fetchType);
        const result = await shiftApi.getAllScheduleData(startDate, endDate);

        setCachedData({ data: result, startDate, endDate });

        // Lọc shifts theo date range hiện tại
        const { startDate: filterStart, endDate: filterEnd } =
          getDateRangeForType(dateRange);
        const filtered = result.shifts.filter(
          (shift) =>
            shift.workDate >= filterStart && shift.workDate <= filterEnd,
        );
        setFilteredShifts(filtered);
      } catch {
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    },
    [
      dateRange,
      cachedData,
      isRangeInCache,
      filterShiftsFromCache,
      getDateRangeForType,
      t,
    ],
  );

  // Khi dateRange thay đổi
  React.useEffect(() => {
    if (isRangeInCache(dateRange)) {
      setFilteredShifts(filterShiftsFromCache(dateRange));
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Callback khi tạo swap request thành công
  const handleSwapSuccess = () => {
    fetchData(true);
  };

  // Loading state
  if (loading && !cachedData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Select
            value={dateRange}
            onValueChange={(value: DateRangeType) => setDateRange(value)}
          >
            <SelectTrigger className="w-40 border-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("thisWeek")}</SelectItem>
              <SelectItem value="month">{t("thisMonth")}</SelectItem>
              <SelectItem value="prevMonth">{t("prevMonth")}</SelectItem>
              <SelectItem value="nextMonth">{t("nextMonth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Tabs */}
      <GlassTabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "shifts" && <ShiftList shifts={filteredShifts} />}
        {activeTab === "swap" && (
          <SwapRequestForm
            shifts={filteredShifts}
            onSuccess={handleSwapSuccess}
          />
        )}
        {activeTab === "history" && (
          <SwapHistory
            requests={cachedData?.data.swapRequests || []}
            onRefresh={() => fetchData(true)}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShiftScheduleView } from "./_shift-schedule-view";
import { SwapRequestForm } from "./_swap-request-form";
import { SwapRequestHistory } from "./_swap-request-history";
import { shiftApi, EmployeeScheduleData } from "@/lib/apis/shift-api";
import type { ShiftAssignment } from "@/types/attendance-records";

type DateRangeType = "week" | "month" | "prevMonth" | "nextMonth";

interface CachedData {
  data: EmployeeScheduleData;
  startDate: string;
  endDate: string;
}

/**
 * Trang lịch ca làm việc của Employee
 * Cache data theo date range, chỉ fetch khi cần
 */
export default function MySchedulePage() {
  const t = useTranslations("shifts");

  const [cachedData, setCachedData] = React.useState<CachedData | null>(null);
  const [filteredShifts, setFilteredShifts] = React.useState<ShiftAssignment[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState<DateRangeType>("week");

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
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
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

  // Fetch data - luôn fetch theo tháng này để có thể cache cho tuần này
  const fetchData = React.useCallback(
    async (forceRefresh = false) => {
      // Nếu đã có cache và không force refresh, kiểm tra xem có thể dùng cache không
      if (!forceRefresh && cachedData && isRangeInCache(dateRange)) {
        setFilteredShifts(filterShiftsFromCache(dateRange));
        return;
      }

      try {
        setIsLoading(true);

        // Luôn fetch theo range được chọn, nhưng nếu là week thì fetch cả month
        let fetchType = dateRange;
        if (dateRange === "week") {
          fetchType = "month"; // Fetch cả tháng để cache
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
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      dateRange,
      cachedData,
      isRangeInCache,
      filterShiftsFromCache,
      getDateRangeForType,
    ],
  );

  // Khi dateRange thay đổi hoặc initial mount
  React.useEffect(() => {
    if (isRangeInCache(dateRange)) {
      // Dùng cache
      setFilteredShifts(filterShiftsFromCache(dateRange));
    } else {
      // Fetch mới
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Callback khi tạo swap request thành công - force refresh
  const handleSwapSuccess = () => {
    fetchData(true);
  };

  if (isLoading && !cachedData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-80" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("myShifts")}</h1>
        <p className="text-muted-foreground">{t("myShiftsDescription")}</p>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        <Select
          value={dateRange}
          onValueChange={(value: DateRangeType) => setDateRange(value)}
        >
          <SelectTrigger className="w-40">
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

      <Tabs defaultValue="shifts" className="w-full">
        <TabsList>
          <TabsTrigger value="shifts">{t("assignedShifts")}</TabsTrigger>
          <TabsTrigger value="swap">{t("requestSwap")}</TabsTrigger>
          <TabsTrigger value="history">{t("swapHistoryTitle")}</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-4">
          <ShiftScheduleView shifts={filteredShifts} />
        </TabsContent>

        <TabsContent value="swap" className="mt-4">
          <SwapRequestForm
            shifts={filteredShifts}
            onSuccess={handleSwapSuccess}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <SwapRequestHistory
            requests={cachedData?.data.swapRequests || []}
            onRefresh={() => fetchData(true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

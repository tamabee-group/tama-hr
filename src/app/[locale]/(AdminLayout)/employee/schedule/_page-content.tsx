"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyScheduleView } from "./_my-schedule-view";
import { ScheduleSelector } from "./_schedule-selector";
import { scheduleSelectionApi } from "@/lib/apis/schedule-selection-api";
import type {
  ScheduleSelection,
  WorkSchedule,
} from "@/types/attendance-records";

/**
 * Nội dung trang lịch làm việc của Employee
 * Bao gồm: Lịch hiện tại, Lịch sắp tới, Chọn lịch mới
 */
export function EmployeeSchedulePageContent() {
  const t = useTranslations("schedules");

  const [currentSchedule, setCurrentSchedule] =
    React.useState<ScheduleSelection | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = React.useState<
    ScheduleSelection[]
  >([]);
  const [availableSchedules, setAvailableSchedules] = React.useState<
    WorkSchedule[]
  >([]);
  const [suggestedSchedules, setSuggestedSchedules] = React.useState<
    WorkSchedule[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch dữ liệu lịch làm việc
  const fetchScheduleData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch từng API riêng để tránh fail toàn bộ nếu 1 API lỗi
      const [currentResult, upcomingResult, availableResult, suggestedResult] =
        await Promise.allSettled([
          scheduleSelectionApi.getMyCurrentSchedule(),
          scheduleSelectionApi.getMyUpcomingSchedules(),
          scheduleSelectionApi.getAvailableSchedules(),
          scheduleSelectionApi.getSuggestedSchedules(),
        ]);

      if (currentResult.status === "fulfilled") {
        setCurrentSchedule(currentResult.value);
      }
      if (upcomingResult.status === "fulfilled") {
        setUpcomingSchedules(upcomingResult.value);
      }
      if (availableResult.status === "fulfilled") {
        setAvailableSchedules(availableResult.value);
      }
      if (suggestedResult.status === "fulfilled") {
        setSuggestedSchedules(suggestedResult.value);
      }
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  // Callback khi chọn lịch thành công
  const handleSelectSuccess = () => {
    fetchScheduleData();
  };

  return (
    <div className="space-y-6">
      {/* Tabs: Lịch của tôi / Chọn lịch */}
      <Tabs defaultValue="my-schedule" className="w-full">
        <TabsList>
          <TabsTrigger value="my-schedule">{t("currentSchedule")}</TabsTrigger>
          <TabsTrigger value="select">{t("selectSchedule")}</TabsTrigger>
        </TabsList>

        <TabsContent value="my-schedule" className="mt-4">
          <MyScheduleView
            currentSchedule={currentSchedule}
            upcomingSchedules={upcomingSchedules}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="select" className="mt-4">
          <ScheduleSelector
            availableSchedules={availableSchedules}
            suggestedSchedules={suggestedSchedules}
            currentSchedule={currentSchedule}
            isLoading={isLoading}
            onSelectSuccess={handleSelectSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

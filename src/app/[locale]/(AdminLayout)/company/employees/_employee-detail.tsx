"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Wallet, Clock, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScheduleTypeBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { DurationDisplay } from "@/app/[locale]/_components/_shared/_time-display";

import { attendanceApi } from "@/lib/apis/attendance-api";
import { workScheduleApi } from "@/lib/apis/work-schedule-api";
import { User } from "@/types/user";
import { AttendanceSummary, WorkSchedule } from "@/types/attendance-records";
import { getFileUrl } from "@/lib/utils/file-url";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface EmployeeDetailProps {
  employee: User;
}

/**
 * Component hiển thị thông tin tổng quan của nhân viên
 * Layout gọn gàng với grid 2 cột
 */
export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const t = useTranslations("users");
  const tAttendance = useTranslations("attendance");
  const tSchedules = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scheduleData, summaryData] = await Promise.all([
        workScheduleApi.getEffectiveSchedule(employee.id).catch(() => null),
        attendanceApi
          .getEmployeeAttendanceSummary(employee.id)
          .catch(() => null),
      ]);
      setSchedule(scheduleData);
      setAttendanceSummary(summaryData);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [employee.id, tErrors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInitials = () => {
    const name = employee.profile?.name || employee.email;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewAttendance = () => {
    router.push(`/${locale}/company/employees/${employee.id}/attendance`);
  };

  const handleViewPayroll = () => {
    router.push(`/${locale}/company/employees/${employee.id}/payroll`);
  };

  return (
    <div className="space-y-6">
      {/* Header: Avatar + Info + Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={getFileUrl(employee.profile?.avatar)} />
              <AvatarFallback className="text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold truncate">
                    {employee.profile?.name || employee.email}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {employee.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{employee.employeeCode}</Badge>
                    <Badge
                      variant={
                        employee.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {employee.status === "ACTIVE"
                        ? tCommon("active")
                        : tCommon("inactive")}
                    </Badge>
                  </div>
                </div>
                {employee.profile?.phone && (
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {employee.profile.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Schedule + Attendance Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              {tSchedules("currentSchedule")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon("loading")}
              </p>
            ) : schedule ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{schedule.name}</span>
                  <ScheduleTypeBadge type={schedule.type} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {tSchedules("workStartTime")}
                    </p>
                    <p className="font-medium">
                      {schedule.scheduleData.workStartTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {tSchedules("workEndTime")}
                    </p>
                    <p className="font-medium">
                      {schedule.scheduleData.workEndTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {tSchedules("breakMinutes")}
                    </p>
                    <p className="font-medium">
                      {schedule.scheduleData.breakMinutes} {tCommon("minutes")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tSchedules("noScheduleAssigned")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                {tAttendance("summary.title")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAttendance}
                className="h-8 px-2"
              >
                {tCommon("viewAll")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon("loading")}
              </p>
            ) : attendanceSummary ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.workingDays")}
                  </p>
                  <p className="text-lg font-bold">
                    {attendanceSummary.presentDays}/
                    {attendanceSummary.totalWorkingDays}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.totalHours")}
                  </p>
                  <DurationDisplay
                    minutes={attendanceSummary.totalWorkingMinutes}
                    className="text-lg font-bold"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.overtime")}
                  </p>
                  <DurationDisplay
                    minutes={attendanceSummary.totalOvertimeMinutes}
                    className="text-lg font-bold text-blue-600"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.lateMinutes")}
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {attendanceSummary.totalLateMinutes} {tCommon("minutes")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tAttendance("messages.noRecords")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payroll Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              {t("payroll")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewPayroll}
              className="h-8 px-2"
            >
              {tCommon("viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("featureUpdating")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

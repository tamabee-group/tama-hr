"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Wallet, Clock, ChevronRight, Banknote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScheduleTypeBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { DurationDisplay } from "@/app/[locale]/_components/_shared/_time-display";
import { PayslipList } from "@/app/[locale]/_components/_shared/payslip-list";

import { attendanceApi } from "@/lib/apis/attendance-api";
import { workScheduleApi } from "@/lib/apis/work-schedule-api";
import { getEmployeeCurrentSalaryConfig } from "@/lib/apis/salary-config-api";
import { payrollApi } from "@/lib/apis/payroll-api";
import { User } from "@/types/user";
import {
  AttendanceSummary,
  WorkSchedule,
  EmployeeSalaryConfig,
  PayrollRecord,
} from "@/types/attendance-records";
import { getFileUrl } from "@/lib/utils/file-url";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale, formatCurrency } from "@/lib/utils/format-currency";

interface EmployeeDetailProps {
  employee: User;
}

/**
 * Component hiển thị thông tin tổng quan của nhân viên
 * Layout gọn gàng với grid responsive
 */
export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const tPayroll = useTranslations("payroll");
  const tAttendance = useTranslations("attendance");
  const tSchedules = useTranslations("schedules");
  const tSalary = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [salaryConfig, setSalaryConfig] = useState<EmployeeSalaryConfig | null>(
    null,
  );
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scheduleData, summaryData, salaryData, payrollData] =
        await Promise.all([
          workScheduleApi.getEffectiveSchedule(employee.id).catch(() => null),
          attendanceApi
            .getEmployeeAttendanceSummary(employee.id)
            .catch(() => null),
          getEmployeeCurrentSalaryConfig(employee.id).catch(() => null),
          payrollApi
            .getEmployeePayrollHistory(employee.id, 0, 4)
            .catch(() => ({ content: [] })),
        ]);
      setSchedule(scheduleData);
      setAttendanceSummary(summaryData);
      setSalaryConfig(salaryData);
      setPayslips(payrollData.content || []);
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

  const handleViewAttendance = () =>
    router.push(`/${locale}/company/employees/${employee.id}/attendance`);
  const handleViewPayroll = () =>
    router.push(`/${locale}/company/employees/${employee.id}/payroll`);
  const handleViewSalary = () =>
    router.push(`/${locale}/company/employees/${employee.id}/salary`);

  const handleViewPayslipDetail = (payslip: PayrollRecord) => {
    router.push(`/${locale}/company/payroll/records/${payslip.id}`);
  };

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case "MONTHLY":
        return tSalary("typeMonthly");
      case "DAILY":
        return tSalary("typeDaily");
      case "HOURLY":
        return tSalary("typeHourly");
      case "SHIFT_BASED":
        return tSalary("typeShiftBased");
      default:
        return type;
    }
  };

  const getSalaryAmount = (config: EmployeeSalaryConfig): number => {
    switch (config.salaryType) {
      case "MONTHLY":
        return config.monthlySalary || 0;
      case "DAILY":
        return config.dailyRate || 0;
      case "HOURLY":
        return config.hourlyRate || 0;
      case "SHIFT_BASED":
        return config.shiftRate || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header: Avatar + Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getFileUrl(employee.profile?.avatar)} />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold truncate">
                    {employee.profile?.name || employee.email}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {employee.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {employee.employeeCode}
                    </Badge>
                    <Badge
                      variant={
                        employee.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-xs"
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

      {/* Row 1: Schedule + Attendance + Salary Config */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Schedule */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {tSchedules("currentSchedule")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon("loading")}
              </p>
            ) : schedule ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{schedule.name}</span>
                  <ScheduleTypeBadge type={schedule.type} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">
                      {tSchedules("workStartTime")}
                    </p>
                    <p className="font-medium">
                      {schedule.scheduleData.workStartTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {tSchedules("workEndTime")}
                    </p>
                    <p className="font-medium">
                      {schedule.scheduleData.workEndTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
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
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                {tAttendance("summary.title")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAttendance}
                className="h-6 px-2 text-xs"
              >
                {tCommon("viewAll")} <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon("loading")}
              </p>
            ) : attendanceSummary ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.workingDays")}
                  </p>
                  <p className="text-base font-bold">
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
                    className="text-base font-bold"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.overtime")}
                  </p>
                  <DurationDisplay
                    minutes={attendanceSummary.totalOvertimeMinutes}
                    className="text-base font-bold text-blue-600"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tAttendance("summary.lateMinutes")}
                  </p>
                  <p className="text-base font-bold text-red-600">
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

        {/* Salary Config */}
        <Card>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Banknote className="h-4 w-4" />
                {tSalary("title")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewSalary}
                className="h-6 px-2 text-xs"
              >
                {salaryConfig ? tCommon("edit") : tSalary("create")}{" "}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon("loading")}
              </p>
            ) : salaryConfig ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tSalary("salaryType")}
                  </p>
                  <p className="font-medium text-sm">
                    {getSalaryTypeLabel(salaryConfig.salaryType)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {tSalary("amount")}
                  </p>
                  <p className="text-base font-bold text-green-600">
                    {formatCurrency(getSalaryAmount(salaryConfig), "ja")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tSalary("noConfig")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Payroll List */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4" />
              {tPayroll("title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewPayroll}
              className="h-6 px-2 text-xs"
            >
              {tCommon("viewAll")} <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              {tCommon("loading")}
            </p>
          ) : (
            <PayslipList
              payslips={payslips}
              onViewDetail={handleViewPayslipDetail}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

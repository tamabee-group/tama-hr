"use client";

import { useTranslations } from "next-intl";
import { Clock, CalendarClock, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkMode } from "@/types/attendance-config";
import { WorkSchedule } from "@/types/attendance-records";

interface ScheduleSummaryCardProps {
  workMode: WorkMode;
  defaultSchedule?: WorkSchedule | null;
  totalSchedules: number;
  totalAssignments: number;
  className?: string;
}

/**
 * Card hiển thị tóm tắt cấu hình lịch làm việc
 * - Hiển thị work mode hiện tại với badge
 * - Hiển thị default schedule (nếu có)
 * - Hiển thị thống kê: số schedules, số assignments
 */
export function ScheduleSummaryCard({
  workMode,
  defaultSchedule,
  totalSchedules,
  totalAssignments,
  className,
}: ScheduleSummaryCardProps) {
  const t = useTranslations("schedules");
  const tWorkMode = useTranslations("companySettings.workMode");

  const isFixedHours = workMode === "FIXED_HOURS";

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <Badge
            variant={isFixedHours ? "secondary" : "default"}
            className="gap-1.5"
          >
            {isFixedHours ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" />
            )}
            {isFixedHours
              ? tWorkMode("fixedHours")
              : tWorkMode("flexibleShift")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Schedule */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t("defaultSchedule")}
            </div>
            {defaultSchedule ? (
              <div className="space-y-0.5">
                <p className="font-medium">{defaultSchedule.name}</p>
                <p className="text-sm text-muted-foreground">
                  {defaultSchedule.scheduleData.workStartTime} -{" "}
                  {defaultSchedule.scheduleData.workEndTime}
                </p>
              </div>
            ) : isFixedHours ? (
              <p className="text-sm text-muted-foreground">
                {tWorkMode("defaultHours")}
              </p>
            ) : (
              <p className="text-sm text-yellow-600">
                {t("noScheduleAssigned")}
              </p>
            )}
          </div>

          {/* Total Schedules */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {t("table.name")}
            </div>
            <p className="text-2xl font-bold">{totalSchedules}</p>
          </div>

          {/* Total Assignments */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {t("table.assignmentCount")}
            </div>
            <p className="text-2xl font-bold">{totalAssignments}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

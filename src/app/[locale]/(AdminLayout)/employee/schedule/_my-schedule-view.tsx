"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { ScheduleSelection } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDate } from "@/lib/utils/format-date";

interface MyScheduleViewProps {
  currentSchedule: ScheduleSelection | null;
  upcomingSchedules: ScheduleSelection[];
  isLoading: boolean;
}

/**
 * Component hiển thị lịch làm việc hiện tại và sắp tới của Employee
 */
export function MyScheduleView({
  currentSchedule,
  upcomingSchedules,
  isLoading,
}: MyScheduleViewProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lịch hiện tại */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("currentSchedule")}</h3>
        {currentSchedule ? (
          <CurrentScheduleCard
            schedule={currentSchedule}
            locale={locale}
            t={t}
            tEnums={tEnums}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("messages.noSchedules")}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lịch sắp tới */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("upcomingSchedule")}</h3>
        {upcomingSchedules.length > 0 ? (
          <div className="space-y-4">
            {upcomingSchedules.map((schedule) => (
              <UpcomingScheduleCard
                key={schedule.id}
                schedule={schedule}
                locale={locale}
                tEnums={tEnums}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              {tCommon("noData")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================
// Current Schedule Card
// ============================================

interface CurrentScheduleCardProps {
  schedule: ScheduleSelection;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
}

function CurrentScheduleCard({
  schedule,
  locale,
  t,
  tEnums,
}: CurrentScheduleCardProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{schedule.scheduleName}</CardTitle>
          <StatusBadge status={schedule.status} tEnums={tEnums} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {t("table.effectiveFrom")}:{" "}
            {formatDate(schedule.effectiveFrom, locale)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {t("table.effectiveTo")}: {formatDate(schedule.effectiveTo, locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Upcoming Schedule Card
// ============================================

interface UpcomingScheduleCardProps {
  schedule: ScheduleSelection;
  locale: SupportedLocale;
  tEnums: ReturnType<typeof useTranslations>;
}

function UpcomingScheduleCard({
  schedule,
  locale,
  tEnums,
}: UpcomingScheduleCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{schedule.scheduleName}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {formatDate(schedule.effectiveFrom, locale)} -{" "}
                {formatDate(schedule.effectiveTo, locale)}
              </span>
            </div>
          </div>
          <StatusBadge status={schedule.status} tEnums={tEnums} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  status: string;
  tEnums: ReturnType<typeof useTranslations>;
}

function StatusBadge({ status, tEnums }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "PENDING":
        return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className="flex items-center">
      {getStatusIcon(status)}
      {getEnumLabel("selectionStatus", status, tEnums)}
    </Badge>
  );
}

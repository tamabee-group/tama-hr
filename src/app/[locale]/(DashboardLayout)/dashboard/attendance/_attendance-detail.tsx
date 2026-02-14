"use client";

import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, Coffee, MapPin } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AttendanceStatusBadge,
  AdjustmentStatusBadge,
} from "@/app/[locale]/_components/_shared/display/_status-badge";
import {
  TimeDisplay,
  DurationDisplay,
} from "@/app/[locale]/_components/_shared/display/_time-display";
import { BreakTimeline } from "../../../(PersonalLayout)/me/attendance/[date]/_break-timeline";
import {
  AttendanceRecord,
  AdjustmentRequest,
  BreakRecord,
} from "@/types/attendance-records";
import {
  formatDateWithDayOfWeek,
  formatDateTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import { useAuth } from "@/hooks/use-auth";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AttendanceDetailProps {
  record: AttendanceRecord;
  adjustmentHistory: AdjustmentRequest[];
  breakRecords?: BreakRecord[];
  minimumBreakRequired?: number;
  maxBreaksPerDay?: number;
}

/**
 * Component hiển thị chi tiết attendance record
 * Bao gồm: thông tin chấm công, thời gian làm việc, lịch sử điều chỉnh
 */
export function AttendanceDetail({
  record,
  adjustmentHistory,
  breakRecords = [],
  minimumBreakRequired = 0,
  maxBreaksPerDay = 3,
}: AttendanceDetailProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;
  const { isCompanyAdmin } = useAuth();

  // Mở Google Maps tại vị trí
  const openMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasCheckInLocation =
    record.checkInLatitude != null && record.checkInLongitude != null;
  const hasCheckOutLocation =
    record.checkOutLatitude != null && record.checkOutLongitude != null;

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <GlassSection
        title={record.employeeName}
        headerAction={<AttendanceStatusBadge status={record.status} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">{t("table.date")}</p>
            <p className="text-lg font-medium">
              {formatDateWithDayOfWeek(record.workDate, locale)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("table.checkInTime")}
            </p>
            <div className="text-lg font-medium">
              <TimeDisplay
                time={record.roundedCheckIn || record.originalCheckIn}
              />
              {record.originalCheckIn &&
                record.roundedCheckIn &&
                record.originalCheckIn !== record.roundedCheckIn && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (gốc: <TimeDisplay time={record.originalCheckIn} />)
                  </span>
                )}
            </div>
            {isCompanyAdmin && hasCheckInLocation && (
              <button
                onClick={() =>
                  openMap(record.checkInLatitude!, record.checkInLongitude!)
                }
                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <MapPin className="h-3 w-3" />
                {t("viewLocation")}
              </button>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("table.checkOutTime")}
            </p>
            <div className="text-lg font-medium">
              <TimeDisplay
                time={record.roundedCheckOut || record.originalCheckOut}
              />
              {record.originalCheckOut &&
                record.roundedCheckOut &&
                record.originalCheckOut !== record.roundedCheckOut && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (gốc: <TimeDisplay time={record.originalCheckOut} />)
                  </span>
                )}
            </div>
            {isCompanyAdmin && hasCheckOutLocation && (
              <button
                onClick={() =>
                  openMap(record.checkOutLatitude!, record.checkOutLongitude!)
                }
                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <MapPin className="h-3 w-3" />
                {t("viewLocation")}
              </button>
            )}
          </div>
        </div>
      </GlassSection>

      {/* Thời gian làm việc */}
      <GlassSection title={t("workingHours")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("table.workingHours")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              <DurationDisplay minutes={record.workingMinutes} />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("overtime")}</p>
            <p className="text-2xl font-bold text-blue-600">
              <DurationDisplay minutes={record.overtimeMinutes} />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("lateMinutes")}</p>
            <p
              className={`text-2xl font-bold ${record.lateMinutes > 0 ? "text-red-600" : ""}`}
            >
              {record.lateMinutes > 0 ? (
                <>{formatMinutesToTime(record.lateMinutes, { locale })}</>
              ) : (
                "-"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("earlyLeaveMinutes")}
            </p>
            <p
              className={`text-2xl font-bold ${record.earlyLeaveMinutes > 0 ? "text-red-600" : ""}`}
            >
              {record.earlyLeaveMinutes > 0 ? (
                <>{formatMinutesToTime(record.earlyLeaveMinutes, { locale })}</>
              ) : (
                "-"
              )}
            </p>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">{t("breakTime")}</p>
            <p className="text-lg font-medium">
              <DurationDisplay minutes={record.totalBreakMinutes} />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("netWorkingHours")}
            </p>
            <p className="text-lg font-medium">
              <DurationDisplay minutes={record.netWorkingMinutes} />
            </p>
          </div>
          {(record.nightMinutes ?? 0) > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.nightHours")}
              </p>
              <p className="text-lg font-medium text-purple-600">
                <DurationDisplay minutes={record.nightMinutes} />
              </p>
            </div>
          )}
          {(record.nightOvertimeMinutes ?? 0) > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.nightOvertimeHours")}
              </p>
              <p className="text-lg font-medium text-purple-600">
                <DurationDisplay minutes={record.nightOvertimeMinutes} />
              </p>
            </div>
          )}
        </div>
      </GlassSection>

      {/* Break Summary */}
      <GlassSection
        title={tBreak("title")}
        icon={<Coffee className="h-5 w-5" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("table.breakDuration")}
            </p>
            <p className="text-2xl font-bold">
              <DurationDisplay minutes={record.totalBreakMinutes} />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {tEnums("breakType.label")}
            </p>
            <p className="text-lg font-medium">
              {record.breakType ? tEnums(`breakType.${record.breakType}`) : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {tBreak("history.complianceTitle")}
            </p>
            <div className="mt-1">
              {record.isBreakCompliant ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {tBreak("history.complianceCompliant")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {tBreak("history.complianceNonCompliant")}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("table.netHours")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              <DurationDisplay minutes={record.netWorkingMinutes} />
            </p>
          </div>
        </div>

        {/* Break Timeline */}
        {breakRecords.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <BreakTimeline
              breakRecords={breakRecords}
              totalBreakMinutes={record.totalBreakMinutes}
              minimumRequired={minimumBreakRequired}
              maxBreaksPerDay={maxBreaksPerDay}
              isCompliant={
                record.isBreakCompliant ?? record.breakCompliant ?? true
              }
              showLocation={isCompanyAdmin}
            />
          </div>
        )}
      </GlassSection>

      {/* Lịch sử điều chỉnh */}
      <GlassSection title={t("myAdjustments")}>
        {adjustmentHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {tCommon("noData")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("adjustment.originalTime")}</TableHead>
                <TableHead>{t("adjustment.requestedTime")}</TableHead>
                <TableHead>{t("adjustment.reason")}</TableHead>
                <TableHead>{tCommon("status")}</TableHead>
                <TableHead>{tCommon("createdAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustmentHistory.map((adj, index) => (
                <TableRow key={adj.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Vào:{" "}
                        </span>
                        <TimeDisplay time={adj.originalCheckIn} />
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Ra:{" "}
                        </span>
                        <TimeDisplay time={adj.originalCheckOut} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Vào:{" "}
                        </span>
                        <TimeDisplay time={adj.requestedCheckIn} />
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Ra:{" "}
                        </span>
                        <TimeDisplay time={adj.requestedCheckOut} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {adj.reason}
                  </TableCell>
                  <TableCell>
                    <AdjustmentStatusBadge status={adj.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(adj.createdAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </GlassSection>
    </div>
  );
}

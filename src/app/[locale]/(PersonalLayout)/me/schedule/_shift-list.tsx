"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar } from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { getDayOfWeek, formatDate } from "@/lib/utils/format-date-time";
import { cn } from "@/lib/utils";
import type { ShiftAssignment } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftListProps {
  shifts: ShiftAssignment[];
}

type ShiftStatus = "past" | "current" | "next" | "future";

function getShiftStatus(
  shift: ShiftAssignment,
  now: Date,
  isFirstFutureShift: boolean,
): ShiftStatus {
  const workDate = shift.workDate;
  const startTime = shift.shiftTemplate?.startTime?.substring(0, 5) || "00:00";
  const endTime = shift.shiftTemplate?.endTime?.substring(0, 5) || "23:59";

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const shiftStart = new Date(workDate);
  shiftStart.setHours(startH, startM, 0, 0);

  const shiftEnd = new Date(workDate);
  shiftEnd.setHours(endH, endM, 0, 0);

  if (endTime < startTime) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  if (now > shiftEnd) return "past";
  if (now >= shiftStart && now <= shiftEnd) return "current";
  if (isFirstFutureShift) return "next";
  return "future";
}

export function ShiftList({ shifts }: ShiftListProps) {
  const t = useTranslations("portal.schedule");
  const locale = useLocale() as SupportedLocale;
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const groupedShifts = React.useMemo(() => {
    if (shifts.length === 0) return [];
    const groups: Record<string, ShiftAssignment[]> = {};
    shifts.forEach((shift) => {
      if (!groups[shift.workDate]) groups[shift.workDate] = [];
      groups[shift.workDate].push(shift);
    });
    Object.values(groups).forEach((dayShifts) => {
      dayShifts.sort((a, b) => {
        const timeA = a.shiftTemplate?.startTime || "";
        const timeB = b.shiftTemplate?.startTime || "";
        return timeA.localeCompare(timeB);
      });
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [shifts]);

  const findFirstFutureShiftId = React.useMemo(() => {
    for (const [, dayShifts] of groupedShifts) {
      for (const shift of dayShifts) {
        const status = getShiftStatus(shift, now, false);
        if (status !== "past" && status !== "current") return shift.id;
      }
    }
    return null;
  }, [groupedShifts, now]);

  if (shifts.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Calendar className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">{t("noShifts")}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Chú thích màu */}
      <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>{t("status.current")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{t("status.next")}</span>
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {groupedShifts.map(([date, dayShifts]) => {
          const hasCurrent = dayShifts.some(
            (s) => getShiftStatus(s, now, false) === "current",
          );
          const allPast = dayShifts.every(
            (s) => getShiftStatus(s, now, false) === "past",
          );

          return (
            <GlassCard
              key={date}
              className={cn(
                "p-4",
                allPast && "opacity-50",
                hasCurrent &&
                  "ring-2 ring-green-500/30 bg-green-50/50 dark:bg-green-900/10",
              )}
            >
              {/* Header ngày */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <div className="text-xs text-gray-500">
                    {getDayOfWeek(date, locale)}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(date, locale).split("/").slice(0, 2).join("/")}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {dayShifts.length} ca
                </div>
              </div>

              {/* Danh sách ca */}
              <div className="space-y-2">
                {dayShifts.map((shift) => {
                  const isFirstFuture = shift.id === findFirstFutureShiftId;
                  const status = getShiftStatus(shift, now, isFirstFuture);
                  const name = shift.shiftTemplate?.name || "";
                  const start =
                    shift.shiftTemplate?.startTime?.substring(0, 5) || "";
                  const end =
                    shift.shiftTemplate?.endTime?.substring(0, 5) || "";

                  return (
                    <div
                      key={shift.id}
                      className={cn(
                        "flex items-center justify-between py-1.5 px-2 rounded-md",
                        status === "past" && "text-gray-400",
                        status === "current" &&
                          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                        status === "next" && "bg-primary/10 text-primary",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="tabular-nums text-xs">
                          {start} - {end}
                        </span>
                        {(status === "current" || status === "next") && (
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              status === "current" && "bg-green-500",
                              status === "next" && "bg-primary",
                            )}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Mobile: Table layout */}
      <GlassCard className="md:hidden overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {groupedShifts.map(([date, dayShifts]) => {
              const hasCurrent = dayShifts.some(
                (s) => getShiftStatus(s, now, false) === "current",
              );
              const allPast = dayShifts.every(
                (s) => getShiftStatus(s, now, false) === "past",
              );

              return (
                <tr
                  key={date}
                  className={cn(
                    allPast && "opacity-40",
                    hasCurrent && "bg-green-50 dark:bg-green-900/10",
                  )}
                >
                  <td className="py-3 px-4 w-30 align-top">
                    <div className="text-xs text-gray-500">
                      {getDayOfWeek(date, locale)}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(date, locale)
                        .split("/")
                        .slice(0, 2)
                        .join("/")}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      {dayShifts.map((shift) => {
                        const isFirstFuture =
                          shift.id === findFirstFutureShiftId;
                        const status = getShiftStatus(
                          shift,
                          now,
                          isFirstFuture,
                        );
                        const name = shift.shiftTemplate?.name || "";
                        const start =
                          shift.shiftTemplate?.startTime?.substring(0, 5) || "";
                        const end =
                          shift.shiftTemplate?.endTime?.substring(0, 5) || "";

                        return (
                          <div
                            key={shift.id}
                            className={cn(
                              "flex items-center gap-2",
                              status === "past" && "text-gray-400",
                              status === "current" &&
                                "text-green-600 dark:text-green-400",
                              status === "next" && "text-primary",
                            )}
                          >
                            <span className="tabular-nums w-24">
                              {start} - {end}
                            </span>
                            <span className="font-medium">{name}</span>
                            {(status === "current" || status === "next") && (
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full shrink-0",
                                  status === "current" && "bg-green-500",
                                  status === "next" && "bg-primary",
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

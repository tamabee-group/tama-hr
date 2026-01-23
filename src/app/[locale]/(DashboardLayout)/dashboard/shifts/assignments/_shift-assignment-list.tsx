"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShiftAssignment } from "@/types/attendance-records";
import { getShiftAssignments } from "@/lib/apis/shift-api";
import { formatDate, getDayOfWeek } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { ShiftAssignmentDialog } from "./_shift-assignment-dialog";
import { BatchDeleteDialog } from "./_batch-delete-dialog";
import { ShiftDetailDialog } from "./_shift-detail-dialog";
import { ExplanationPanel } from "../../_components/_explanation-panel";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 50;
const STORAGE_KEY = "shift-assignment-filter-mode";

type FilterMode = "month" | "week" | "day";

/**
 * Component danh sách phân công ca làm việc - nhóm theo ngày
 */
export function ShiftAssignmentList() {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  // Load filter mode từ localStorage
  const getInitialFilterMode = (): FilterMode => {
    if (typeof window === "undefined") return "month";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "month" || saved === "week" || saved === "day") {
      return saved;
    }
    return "month";
  };

  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] =
    useState<ShiftAssignment | null>(null);
  const [filterMode, setFilterMode] =
    useState<FilterMode>(getInitialFilterMode);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Helper: Convert Date sang string YYYY-MM-DD theo local timezone
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch danh sách assignments với filter
  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);

      let startDate: string | undefined;
      let endDate: string | undefined;

      if (filterMode === "month") {
        // Filter theo tháng
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        startDate = toLocalDateString(firstDay);
        endDate = toLocalDateString(lastDay);
      } else if (filterMode === "week") {
        // Filter theo tuần (Thứ 2 - Chủ nhật)
        const day = selectedDate.getDay();
        const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(selectedDate);
        monday.setDate(diff);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        startDate = toLocalDateString(monday);
        endDate = toLocalDateString(sunday);
      } else {
        // Filter theo ngày cụ thể
        startDate = toLocalDateString(selectedDate);
        endDate = startDate;
      }

      const response = await getShiftAssignments(page, DEFAULT_LIMIT, {
        startDate,
        endDate,
      });
      setAssignments(response.content);
      setTotalElements(response.totalElements);
    } catch {
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedDate, filterMode, tCommon]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Nhóm assignments theo ngày
  const groupedAssignments = useMemo(() => {
    const groups: Record<string, ShiftAssignment[]> = {};

    assignments.forEach((assignment) => {
      const date = assignment.workDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(assignment);
    });

    // Sắp xếp theo ngày tăng dần (cũ nhất trước)
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [assignments]);

  // Chuyển tháng/tuần/ngày
  const handlePrevious = () => {
    if (filterMode === "month") {
      setSelectedDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
      );
    } else if (filterMode === "week") {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else if (filterMode === "day") {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
      });
    }
    setPage(0);
  };

  const handleNext = () => {
    if (filterMode === "month") {
      setSelectedDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
      );
    } else if (filterMode === "week") {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else if (filterMode === "day") {
      setSelectedDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      });
    }
    setPage(0);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setFilterMode("day"); // Chuyển sang filter theo ngày
    setPage(0);
    setIsDatePickerOpen(false);
    // Lưu vào localStorage
    localStorage.setItem(STORAGE_KEY, "day");
  };

  // Xử lý thay đổi filter mode
  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setPage(0);
    setIsDatePickerOpen(false);
    // Lưu vào localStorage
    localStorage.setItem(STORAGE_KEY, mode);
  };

  // Xử lý chọn ngày từ calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setPage(0);
      setIsDatePickerOpen(false);
    }
  };

  // Format hiển thị
  const formatDisplayDate = () => {
    if (filterMode === "month") {
      return selectedDate.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
      });
    } else if (filterMode === "week") {
      const day = selectedDate.getDay();
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(selectedDate);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${formatDate(toLocalDateString(monday), locale)} - ${formatDate(toLocalDateString(sunday), locale)}`;
    } else {
      return formatDate(toLocalDateString(selectedDate), locale);
    }
  };

  // Format thời gian HH:mm
  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    return time.substring(0, 5);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalElements / DEFAULT_LIMIT);

  // Kiểm tra ngày hôm nay
  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <>
      {/* Explanation Panel */}
      <ExplanationPanel
        title={t("explanations.assignmentsTitle")}
        description={t("explanations.assignmentsDesc")}
        tips={[
          t("explanations.assignmentsTip1"),
          t("explanations.assignmentsTip2"),
        ]}
        workModeNote={t("explanations.assignmentsNote")}
        defaultCollapsed={true}
        className="mb-4"
      />

      <Card className="md:py-6 md:shadow-sm md:border py-0 shadow-none border-none">
        <CardContent className="px-0 md:px-6">
          {/* Filter Controls */}
          <div className="flex flex-col justify-between items-center md:flex-row gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              {/* Filter Mode Tabs */}
              <Tabs
                value={filterMode}
                onValueChange={(value) =>
                  handleFilterModeChange(value as FilterMode)
                }
              >
                <TabsList className="w-full md:w-fit">
                  <TabsTrigger value="month">{t("filterMonth")}</TabsTrigger>
                  <TabsTrigger value="week">{t("filterWeek")}</TabsTrigger>
                  <TabsTrigger value="day">{t("filterDay")}</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="shrink-0"
                >
                  <ChevronLeft />
                </Button>

                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{formatDisplayDate()}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToday}
                        className="w-full"
                      >
                        {tCommon("today")}
                      </Button>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      month={selectedDate}
                      onMonthChange={setSelectedDate}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="shrink-0"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBatchDeleteOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                {t("batchDelete")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("createAssignment")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {tCommon("loading")}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noAssignments")}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedAssignments.map(([date, items]) => {
                const today = isToday(date);
                return (
                  <div key={date} className="space-y-2">
                    {/* Header ngày */}
                    <div
                      className={`flex items-center gap-2 py-2 border-b ${
                        today ? "border-primary" : ""
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          today ? "text-primary" : "text-primary"
                        }`}
                      >
                        {getDayOfWeek(date, locale)}
                      </span>
                      <span
                        className={`text-sm ${
                          today
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(date, locale)}
                      </span>
                      {today && (
                        <Badge variant="default" className="text-xs">
                          {tCommon("today")}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="ml-auto">
                        {items.length}
                      </Badge>
                    </div>

                    {/* Danh sách assignments trong ngày */}
                    <div className="space-y-2">
                      {items.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border bg-card hover:inset-shadow-2xs transition-colors cursor-pointer",
                            today && "border-primary bg-primary/10",
                          )}
                          onClick={() => setViewingAssignment(assignment)}
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium">
                                {assignment.employeeName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.shiftName ||
                                  assignment.shiftTemplate?.name}{" "}
                                •{" "}
                                {formatTime(
                                  assignment.shiftStartTime ||
                                    assignment.shiftTemplate?.startTime,
                                )}{" "}
                                -{" "}
                                {formatTime(
                                  assignment.shiftEndTime ||
                                    assignment.shiftTemplate?.endTime,
                                )}
                              </div>
                            </div>
                          </div>

                          <Badge
                            variant={
                              assignment.status === "COMPLETED"
                                ? "default"
                                : assignment.status === "SWAPPED"
                                  ? "secondary"
                                  : assignment.status === "CANCELLED"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {getEnumLabel(
                              "shiftAssignmentStatus",
                              assignment.status,
                              tEnums,
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <ShiftAssignmentDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchAssignments}
      />

      {/* Batch Delete Dialog */}
      <BatchDeleteDialog
        open={isBatchDeleteOpen}
        onOpenChange={setIsBatchDeleteOpen}
        onSuccess={fetchAssignments}
      />

      {/* Detail Dialog */}
      <ShiftDetailDialog
        open={!!viewingAssignment}
        onOpenChange={(open: boolean) => !open && setViewingAssignment(null)}
        assignment={viewingAssignment}
        onDelete={fetchAssignments}
      />
    </>
  );
}
